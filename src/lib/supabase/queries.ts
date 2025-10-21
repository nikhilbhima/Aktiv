// @ts-nocheck - Disable type checking until database schema is deployed
// =====================================================
// SUPABASE QUERY HELPERS
// Reusable database query functions
//
// Note: Type checking is disabled for this file until the Supabase
// database is deployed and types can be generated from the live schema.
// Once deployed, run: npx supabase gen types typescript --project-id <id>
// to generate accurate types and re-enable type checking.
// =====================================================

import type { User, Goal, Checkin } from '@/types/database.types'
import { createClient } from './client'

type SupabaseClient = ReturnType<typeof createClient>

// =====================================================
// USER QUERIES
// =====================================================

export async function getUserById(supabase: SupabaseClient, userId: string) {
  return await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
}

export async function getUserByUsername(supabase: SupabaseClient, username: string) {
  return await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()
}

export async function updateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<User>
) {
  return await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
}

// =====================================================
// GOAL QUERIES
// =====================================================

export async function getUserGoals(
  supabase: SupabaseClient,
  userId: string,
  status?: 'active' | 'completed' | 'paused' | 'abandoned'
) {
  let query = supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  return await query
}

export async function getGoalWithCheckins(supabase: SupabaseClient, goalId: string) {
  return await supabase
    .from('goals')
    .select(`
      *,
      checkins (*)
    `)
    .eq('id', goalId)
    .single()
}

export async function createGoal(
  supabase: SupabaseClient,
  goal: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'total_checkins' | 'current_streak' | 'longest_streak' | 'completed_at'>
) {
  return await supabase
    .from('goals')
    .insert(goal)
    .select()
    .single()
}

export async function updateGoal(
  supabase: SupabaseClient,
  goalId: string,
  updates: Partial<Goal>
) {
  return await supabase
    .from('goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single()
}

// =====================================================
// CHECKIN QUERIES
// =====================================================

export async function createCheckin(
  supabase: SupabaseClient,
  checkin: Omit<Checkin, 'id' | 'created_at'>
) {
  return await supabase
    .from('checkins')
    .insert(checkin)
    .select()
    .single()
}

export async function getGoalCheckins(
  supabase: SupabaseClient,
  goalId: string,
  limit = 30
) {
  return await supabase
    .from('checkins')
    .select('*')
    .eq('goal_id', goalId)
    .order('completed_at', { ascending: false })
    .limit(limit)
}

// =====================================================
// MATCH QUERIES
// =====================================================

export async function getUserMatches(
  supabase: SupabaseClient,
  userId: string,
  status?: 'pending' | 'accepted' | 'rejected' | 'blocked'
) {
  let query = supabase
    .from('matches')
    .select(`
      *,
      user1:users!matches_user1_id_fkey (*),
      user2:users!matches_user2_id_fkey (*)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)

  if (status) {
    query = query.eq('status', status)
  }

  return await query
}

export async function createMatch(
  supabase: SupabaseClient,
  user1Id: string,
  user2Id: string,
  matchScore?: number,
  isIrlMatch = false
) {
  const [smaller, larger] = [user1Id, user2Id].sort()

  return await supabase
    .from('matches')
    .insert({
      user1_id: smaller,
      user2_id: larger,
      match_score: matchScore ?? null,
      is_irl_match: isIrlMatch,
      status: 'pending',
    })
    .select()
    .single()
}

export async function updateMatchStatus(
  supabase: SupabaseClient,
  matchId: string,
  status: 'accepted' | 'rejected' | 'blocked'
) {
  const updates: any = { status }

  if (status === 'accepted') {
    updates.accepted_at = new Date().toISOString()
  }

  return await supabase
    .from('matches')
    .update(updates)
    .eq('id', matchId)
    .select()
    .single()
}

// =====================================================
// MESSAGE QUERIES
// =====================================================

export async function getMatchMessages(
  supabase: SupabaseClient,
  matchId: string,
  limit = 50
) {
  return await supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('sent_at', { ascending: true })
    .limit(limit)
}

export async function sendMessage(
  supabase: SupabaseClient,
  matchId: string,
  senderId: string,
  content: string
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      match_id: matchId,
      sender_id: senderId,
      content,
    })
    .select()
    .single()

  if (error) throw error

  await supabase
    .from('matches')
    .update({ last_interaction_at: new Date().toISOString() })
    .eq('id', matchId)

  return { data, error }
}

export async function markMessageAsRead(
  supabase: SupabaseClient,
  messageId: string
) {
  return await supabase
    .from('messages')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', messageId)
    .select()
    .single()
}

// =====================================================
// MATCHING ALGORITHM QUERIES
// =====================================================

export async function findAccountabilityMatches(
  supabase: SupabaseClient,
  userId: string,
  limit = 20
) {
  return await supabase.rpc('find_accountability_matches', {
    for_user_id: userId,
    limit_count: limit,
  })
}

export async function findIRLMatches(
  supabase: SupabaseClient,
  userId: string,
  maxDistanceKm = 50,
  limit = 20
) {
  return await supabase.rpc('find_irl_matches', {
    for_user_id: userId,
    max_distance_meters: maxDistanceKm * 1000,
    limit_count: limit,
  })
}

// =====================================================
// IRL ACTIVITY QUERIES
// =====================================================

export async function getIRLActivities(
  supabase: SupabaseClient,
  filters?: {
    category?: string
    status?: 'open' | 'full' | 'cancelled' | 'completed'
    futureOnly?: boolean
  }
) {
  let query = supabase
    .from('irl_activities')
    .select(`
      *,
      creator:users!irl_activities_creator_id_fkey (*)
    `)
    .order('scheduled_at', { ascending: true })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.futureOnly) {
    query = query.gte('scheduled_at', new Date().toISOString())
  }

  return await query
}

export async function createIRLActivity(
  supabase: SupabaseClient,
  activity: {
    creator_id: string
    title: string
    description?: string
    category: string
    location_name: string
    location_address?: string
    location_point?: unknown
    scheduled_at: string
    duration_minutes?: number
    max_participants?: number
  }
) {
  return await supabase
    .from('irl_activities')
    .insert(activity)
    .select()
    .single()
}

export async function joinIRLActivity(
  supabase: SupabaseClient,
  activityId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from('irl_activity_participants')
    .insert({
      activity_id: activityId,
      user_id: userId,
      status: 'confirmed',
    })
    .select()
    .single()

  if (error) throw error

  const { data: activity } = await supabase
    .from('irl_activities')
    .select('current_participants')
    .eq('id', activityId)
    .single()

  if (activity) {
    await supabase
      .from('irl_activities')
      .update({ current_participants: activity.current_participants + 1 })
      .eq('id', activityId)
  }

  return { data, error }
}

export async function leaveIRLActivity(
  supabase: SupabaseClient,
  activityId: string,
  userId: string
) {
  const { error } = await supabase
    .from('irl_activity_participants')
    .delete()
    .eq('activity_id', activityId)
    .eq('user_id', userId)

  if (error) throw error

  const { data: activity } = await supabase
    .from('irl_activities')
    .select('current_participants')
    .eq('id', activityId)
    .single()

  if (activity && activity.current_participants > 0) {
    await supabase
      .from('irl_activities')
      .update({ current_participants: activity.current_participants - 1 })
      .eq('id', activityId)
  }
}
