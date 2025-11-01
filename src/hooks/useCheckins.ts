import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Checkin, CheckinMood } from '@/types/database.types';

interface CheckinWithGoal extends Checkin {
  goal?: {
    id: string;
    title: string;
    category: string;
  };
}

export function useCheckins() {
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<CheckinWithGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchCheckins = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch user's check-ins with goal details
      const { data, error: fetchError } = await supabase
        .from('checkins')
        .select(`
          *,
          goal:goals(id, title, category)
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;

      setCheckins(data || []);
    } catch (err) {
      console.error('Error fetching check-ins:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch check-ins');
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (!user) {
      setCheckins([]);
      setLoading(false);
      return;
    }

    fetchCheckins();
  }, [user, fetchCheckins]);

  const createCheckin = async (
    goalId: string,
    data: {
      note?: string;
      proof_url?: string;
      mood?: CheckinMood;
      imageFile?: File;
    }
  ) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      let proofUrl = data.proof_url;

      // Upload image if provided
      if (data.imageFile) {
        const fileExt = data.imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `checkins/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('checkins')
          .upload(filePath, data.imageFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Failed to upload image');
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('checkins')
          .getPublicUrl(filePath);

        proofUrl = publicUrl;
      }

      const { data: checkin, error } = await supabase
        .from('checkins')
        // @ts-expect-error - Supabase Insert type inference issue
        .insert({
          goal_id: goalId,
          user_id: user.id,
          note: data.note || null,
          proof_url: proofUrl || null,
          mood: data.mood || null,
          completed_at: new Date().toISOString(),
        })
        .select(`
          *,
          goal:goals(id, title, category)
        `)
        .single();

      if (error) throw error;

      // Add to local state
      setCheckins((prev) => [checkin, ...prev]);

      // Update goal streaks (backend should handle this via triggers or we do it here)
      await updateGoalStreaks(goalId);

      return { data: checkin, error: null };
    } catch (err) {
      console.error('Error creating check-in:', err);
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create check-in',
      };
    }
  };

  const updateGoalStreaks = async (goalId: string) => {
    // This function updates the goal's streak counters
    // Ideally this should be done via database triggers, but we can do it here too
    try {
      // Get all check-ins for this goal
      const { data: goalCheckins } = (await supabase
        .from('checkins')
        .select('completed_at')
        .eq('goal_id', goalId)
        .order('completed_at', { ascending: false })) as any;

      if (!goalCheckins || goalCheckins.length === 0) return;

      // Calculate current streak
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < goalCheckins.length; i++) {
        const checkinDate = new Date(goalCheckins[i].completed_at);
        checkinDate.setHours(0, 0, 0, 0);

        if (i === 0) {
          // First check-in (most recent)
          const daysDiff = Math.floor((today.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff <= 1) {
            currentStreak = 1;
            tempStreak = 1;
          }
        } else {
          // Check if consecutive days
          const prevCheckinDate = new Date(goalCheckins[i - 1].completed_at);
          prevCheckinDate.setHours(0, 0, 0, 0);

          const daysDiff = Math.floor((prevCheckinDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysDiff === 1) {
            tempStreak++;
            if (i < currentStreak || currentStreak > 0) {
              currentStreak++;
            }
          } else {
            if (tempStreak > longestStreak) {
              longestStreak = tempStreak;
            }
            tempStreak = 1;
          }
        }
      }

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }

      // Update goal with new streak values
      await supabase
        .from('goals')
        // @ts-expect-error - Supabase Update type inference issue
        .update({
          current_streak: currentStreak,
          longest_streak: Math.max(longestStreak, currentStreak),
          total_checkins: goalCheckins.length,
        })
        .eq('id', goalId);

      // Also update user's total check-ins and streak
      if (!user?.id) return;

      const { data: userCheckins } = (await supabase
        .from('checkins')
        .select('completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })) as any;

      if (userCheckins && userCheckins.length > 0) {
        // Calculate user's overall streak
        let userStreak = 0;
        const userToday = new Date();
        userToday.setHours(0, 0, 0, 0);

        for (let i = 0; i < userCheckins.length; i++) {
          const checkinDate = new Date(userCheckins[i].completed_at);
          checkinDate.setHours(0, 0, 0, 0);

          if (i === 0) {
            const daysDiff = Math.floor((userToday.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff <= 1) {
              userStreak = 1;
            } else {
              break;
            }
          } else {
            const prevCheckinDate = new Date(userCheckins[i - 1].completed_at);
            prevCheckinDate.setHours(0, 0, 0, 0);

            const daysDiff = Math.floor((prevCheckinDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff === 1) {
              userStreak++;
            } else {
              break;
            }
          }
        }

        await supabase
          .from('users')
          // @ts-expect-error - Supabase Update type inference issue
          .update({
            streak_days: userStreak,
            total_checkins: userCheckins.length,
          })
          .eq('id', user?.id);
      }
    } catch (err) {
      console.error('Error updating streaks:', err);
      // Non-critical, don't throw
    }
  };

  const deleteCheckin = async (checkinId: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      // Get the goal_id before deleting
      const checkinToDelete = checkins.find(c => c.id === checkinId);
      const goalId = checkinToDelete?.goal_id;

      const { error } = await supabase
        .from('checkins')
        .delete()
        .eq('id', checkinId);

      if (error) throw error;

      // Remove from local state
      setCheckins((prev) => prev.filter((c) => c.id !== checkinId));

      // Update goal streaks
      if (goalId) {
        await updateGoalStreaks(goalId);
      }

      return { error: null };
    } catch (err) {
      console.error('Error deleting check-in:', err);
      return {
        error: err instanceof Error ? err.message : 'Failed to delete check-in',
      };
    }
  };

  const getTodayCheckins = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return checkins.filter(checkin => {
      const checkinDate = new Date(checkin.completed_at);
      checkinDate.setHours(0, 0, 0, 0);
      return checkinDate.getTime() === today.getTime();
    });
  };

  const getCheckinsByGoal = (goalId: string) => {
    return checkins.filter(c => c.goal_id === goalId);
  };

  const getCheckinsByDateRange = (startDate: Date, endDate: Date) => {
    return checkins.filter(checkin => {
      const checkinDate = new Date(checkin.completed_at);
      return checkinDate >= startDate && checkinDate <= endDate;
    });
  };

  return {
    checkins,
    loading,
    error,
    createCheckin,
    deleteCheckin,
    refresh: fetchCheckins,
    getTodayCheckins,
    getCheckinsByGoal,
    getCheckinsByDateRange,
  };
}
