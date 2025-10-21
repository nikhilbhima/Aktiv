import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Goal } from '@/types/database.types';

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchGoals = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setGoals(data || []);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    fetchGoals();
  }, [user, fetchGoals]);

  const createGoal = async (goalData: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      // @ts-ignore - Type mismatch with Supabase generics
      const { data, error } = await supabase
        .from('goals')
        .insert({
          ...goalData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setGoals((prev) => [data, ...prev]);

      return { data, error: null };
    } catch (err) {
      console.error('Error creating goal:', err);
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create goal',
      };
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      // @ts-ignore - Type mismatch with Supabase generics
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', goalId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state AFTER confirming DB success
      setGoals((prev) =>
        prev.map((goal) => (goal.id === goalId ? data : goal))
      );

      return { data, error: null };
    } catch (err) {
      console.error('Error updating goal:', err);
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update goal',
      };
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove from local state AFTER confirming DB success
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));

      return { error: null };
    } catch (err) {
      console.error('Error deleting goal:', err);
      return {
        error: err instanceof Error ? err.message : 'Failed to delete goal',
      };
    }
  };

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    refresh: fetchGoals,
  };
}
