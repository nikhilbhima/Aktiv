'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface MatchRequest {
  id: string
  user1_id: string
  user2_id: string
  status: 'pending' | 'accepted' | 'rejected' | 'blocked'
  mode: 'accountability' | 'irl'
  created_at: string
  updated_at: string
  requester: {
    id: string
    full_name: string
    username: string
    avatar_url: string | null
    bio: string | null
  }
}

export function useRequests(userId: string | undefined) {
  const [requests, setRequests] = useState<MatchRequest[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Fetch pending match requests
  const fetchRequests = async () => {
    if (!userId) {
      setRequests([])
      setLoading(false)
      return
    }

    try {
      // Get requests where current user is user2 (receiver) and status is pending
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          user1_id,
          user2_id,
          status,
          mode,
          created_at,
          updated_at,
          requester:user1_id (
            id,
            full_name,
            username,
            avatar_url,
            bio
          )
        `)
        .eq('user2_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform data to match interface
      const transformedData = (data || []).map((item: any) => ({
        ...item,
        requester: Array.isArray(item.requester) ? item.requester[0] : item.requester
      }))

      setRequests(transformedData)
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  // Accept match request
  const acceptRequest = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId)

      if (error) throw error

      // Remove from requests list
      setRequests(prev => prev.filter(r => r.id !== matchId))

      // Create notification for requester
      const request = requests.find(r => r.id === matchId)
      if (request) {
        await supabase.from('notifications').insert({
          user_id: request.user1_id,
          type: 'match_accepted',
          title: 'Match Accepted!',
          message: `${request.requester.full_name} accepted your connection request`,
          related_id: matchId,
          is_read: false
        })
      }

      return { success: true }
    } catch (error) {
      console.error('Error accepting request:', error)
      return { success: false, error }
    }
  }

  // Reject match request
  const rejectRequest = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId)

      if (error) throw error

      // Remove from requests list
      setRequests(prev => prev.filter(r => r.id !== matchId))

      return { success: true }
    } catch (error) {
      console.error('Error rejecting request:', error)
      return { success: false, error }
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [userId])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId) return

    let channel: RealtimeChannel | null = null

    const setupSubscription = async () => {
      channel = supabase
        .channel(`match_requests:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'matches',
            filter: `user2_id=eq.${userId}`,
          },
          () => {
            // Refresh requests when new one arrives
            fetchRequests()
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'matches',
            filter: `user2_id=eq.${userId}`,
          },
          () => {
            // Refresh requests when one is updated
            fetchRequests()
          }
        )
        .subscribe()
    }

    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [userId])

  return {
    requests,
    loading,
    acceptRequest,
    rejectRequest,
    refreshRequests: fetchRequests,
  }
}
