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
      const isIRLMode = mode === 'irl';
      const { data, error: matchError } = await supabase.rpc(
        isIRLMode ? 'find_irl_matches' : 'find_accountability_matches',
        isIRLMode
          ? {
              for_user_id: user.id,
              max_distance_meters: 50000, // 50km
              limit_count: 20,
            }
          : {
              for_user_id: user.id,
              limit_count: 20,
            }
      );

      if (matchError) throw matchError;

      if (!data || data.length === 0) {
        setMatches([]);
        return;
      }

      // Extract all user IDs
      const userIds = data.map((match: any) => match.user_id);

      // Batch fetch all users in one query
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds);

      if (usersError) throw usersError;

      // Batch fetch all goals in one query
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .in('user_id', userIds)
        .eq('status', 'active')
        .eq('is_public', true);

      if (goalsError) throw goalsError;

      // Create lookup maps for O(1) access
      const usersMap = new Map(
        (usersData || []).map((user) => [user.id, user])
      );
      const goalsByUser = (goalsData || []).reduce((acc: any, goal) => {
        if (!acc[goal.user_id]) acc[goal.user_id] = [];
        acc[goal.user_id].push(goal);
        return acc;
      }, {});

      // Transform matches using the fetched data
      const transformedMatches = data
        .map((match: any) => {
          const user = usersMap.get(match.user_id);
          if (!user) return null; // Skip if user not found

          const userGoals = (goalsByUser[match.user_id] || []).slice(0, 3);

          return {
            id: match.user_id,
            user,
            goals: userGoals,
            matchScore: match.match_score,
            distance: isIRLMode ? match.distance_km : null,
            isIRL: isIRLMode,
          };
        })
        .filter((match): match is MatchWithDetails => match !== null);

      setMatches(transformedMatches);
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
