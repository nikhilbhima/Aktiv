import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { User, Goal } from '@/types/database.types';

interface MatchWithDetails {
  id: string;
  user: User;
  goals: Goal[];
  matchScore: number | null;
  distance: number | null;
  isIRL: boolean;
}

export function useMatches(mode: 'accountability' | 'irl') {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setMatches([]);
      setLoading(false);
      return;
    }

    fetchMatches();
  }, [user, mode]);

  const fetchMatches = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Call the appropriate matching function based on mode
      if (mode === 'irl') {
        // IRL mode - find nearby users (within 50km)
        const { data, error: matchError } = await supabase.rpc(
          'find_irl_matches',
          {
            for_user_id: user.id,
            max_distance_meters: 50000, // 50km
            limit_count: 20,
          }
        );

        if (matchError) throw matchError;

        // Transform the data
        const transformedMatches = await Promise.all(
          (data || []).map(async (match: any) => {
            // Fetch user details
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', match.user_id)
              .single();

            if (userError) throw userError;

            // Fetch user's active goals
            const { data: goalsData, error: goalsError } = await supabase
              .from('goals')
              .select('*')
              .eq('user_id', match.user_id)
              .eq('status', 'active')
              .eq('is_public', true)
              .limit(3);

            if (goalsError) throw goalsError;

            return {
              id: match.user_id,
              user: userData,
              goals: goalsData || [],
              matchScore: match.match_score,
              distance: match.distance_km,
              isIRL: true,
            };
          })
        );

        setMatches(transformedMatches);
      } else {
        // Accountability mode - find online partners
        const { data, error: matchError } = await supabase.rpc(
          'find_accountability_matches',
          {
            for_user_id: user.id,
            limit_count: 20,
          }
        );

        if (matchError) throw matchError;

        // Transform the data
        const transformedMatches = await Promise.all(
          (data || []).map(async (match: any) => {
            // Fetch user details
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', match.user_id)
              .single();

            if (userError) throw userError;

            // Fetch user's active goals
            const { data: goalsData, error: goalsError } = await supabase
              .from('goals')
              .select('*')
              .eq('user_id', match.user_id)
              .eq('status', 'active')
              .eq('is_public', true)
              .limit(3);

            if (goalsError) throw goalsError;

            return {
              id: match.user_id,
              user: userData,
              goals: goalsData || [],
              matchScore: match.match_score,
              distance: null,
              isIRL: false,
            };
          })
        );

        setMatches(transformedMatches);
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const sendMatchRequest = async (targetUserId: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      // Create match with pending status
      // Ensure user1_id < user2_id per constraint
      const user1_id = user.id < targetUserId ? user.id : targetUserId;
      const user2_id = user.id < targetUserId ? targetUserId : user.id;

      // @ts-ignore - Type mismatch with Supabase generics
      const { data, error } = await supabase
        .from('matches')
        .insert({
          user1_id,
          user2_id,
          status: 'pending',
          is_irl_match: mode === 'irl',
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh matches to remove the user we just sent a request to
      await fetchMatches();

      return { data, error: null };
    } catch (err) {
      console.error('Error sending match request:', err);
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to send request',
      };
    }
  };

  return {
    matches,
    loading,
    error,
    sendMatchRequest,
    refresh: fetchMatches,
  };
}
