// @ts-nocheck
// Type checking disabled - will be re-enabled after Supabase database deployment
// =====================================================
// SUPABASE QUERY HELPERS
// =====================================================

import type { User, Goal } from '@/types/database.types'
import { createClient } from './client'

type SupabaseClient = ReturnType<typeof createClient>

export async function getUserById(supabase: SupabaseClient, userId: string) {
  return await supabase.from('users').select('*').eq('id', userId).single()
}

export async function getUserByUsername(supabase: SupabaseClient, username: string) {
  return await supabase.from('users').select('*').eq('username', username).single()
}

export async function updateUserProfile(supabase: SupabaseClient, userId: string, updates: Partial<User>) {
  return await supabase.from('users').update(updates).eq('id', userId).select().single()
}

export async function getUserGoals(supabase: SupabaseClient, userId: string, status?: string) {
  let query = supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  return await query
}

export async function getGoalWithCheckins(supabase: SupabaseClient, goalId: string) {
  return await supabase.from('goals').select('*, checkins (*)').eq('id', goalId).single()
}

export async function createGoal(supabase: SupabaseClient, goal: any) {
  return await supabase.from('goals').insert(goal).select().single()
}

export async function updateGoal(supabase: SupabaseClient, goalId: string, updates: Partial<Goal>) {
  return await supabase.from('goals').update(updates).eq('id', goalId).select().single()
}

export async function createCheckin(supabase: SupabaseClient, checkin: any) {
  return await supabase.from('checkins').insert(checkin).select().single()
}

export async function getGoalCheckins(supabase: SupabaseClient, goalId: string, limit = 30) {
  return await supabase.from('checkins').select('*').eq('goal_id', goalId).order('completed_at', { ascending: false }).limit(limit)
}

export async function getUserMatches(supabase: SupabaseClient, userId: string, status?: string) {
  let query = supabase.from('matches').select('*, user1:users!matches_user1_id_fkey (*), user2:users!matches_user2_id_fkey (*)').or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
  if (status) query = query.eq('status', status)
  return await query
}

export async function createMatch(supabase: SupabaseClient, user1Id: string, user2Id: string, matchScore?: number, isIrlMatch = false) {
  const [smaller, larger] = [user1Id, user2Id].sort()
  return await supabase.from('matches').insert({ user1_id: smaller, user2_id: larger, match_score: matchScore ?? null, is_irl_match: isIrlMatch, status: 'pending' }).select().single()
}

export async function updateMatchStatus(supabase: SupabaseClient, matchId: string, status: string) {
  const updates: any = { status }
  if (status === 'accepted') updates.accepted_at = new Date().toISOString()
  return await supabase.from('matches').update(updates).eq('id', matchId).select().single()
}

export async function getMatchMessages(supabase: SupabaseClient, matchId: string, limit = 50) {
  return await supabase.from('messages').select('*').eq('match_id', matchId).order('sent_at', { ascending: true }).limit(limit)
}

export async function sendMessage(supabase: SupabaseClient, matchId: string, senderId: string, content: string) {
  const { data, error } = await supabase.from('messages').insert({ match_id: matchId, sender_id: senderId, content }).select().single()
  if (error) throw error
  await supabase.from('matches').update({ last_interaction_at: new Date().toISOString() }).eq('id', matchId)
  return { data, error }
}

export async function markMessageAsRead(supabase: SupabaseClient, messageId: string) {
  return await supabase.from('messages').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', messageId).select().single()
}

export async function findAccountabilityMatches(supabase: SupabaseClient, userId: string, limit = 20) {
  return await supabase.rpc('find_accountability_matches', { for_user_id: userId, limit_count: limit })
}

export async function findIRLMatches(supabase: SupabaseClient, userId: string, maxDistanceKm = 50, limit = 20) {
  return await supabase.rpc('find_irl_matches', { for_user_id: userId, max_distance_meters: maxDistanceKm * 1000, limit_count: limit })
}

// IRL Activities removed - now using unified approach with optional location filtering

export async function deleteGoal(supabase: SupabaseClient, goalId: string) {
  return await supabase.from('goals').delete().eq('id', goalId)
}

export async function createReport(supabase: SupabaseClient, reporterId: string, reportedUserId: string, reason: string, details?: string) {
  return await supabase.from('reports').insert({
    reporter_id: reporterId,
    reported_user_id: reportedUserId,
    reason,
    details: details || null
  }).select().single()
}
