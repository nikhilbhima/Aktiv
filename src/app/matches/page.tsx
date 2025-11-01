'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useMatches } from '@/hooks/useMatches'
import { createClient } from '@/lib/supabase/client'
import { Users, MapPin, Target, Heart, X, Check, MessageCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { Match } from '@/types/database.types'

const CATEGORY_EMOJIS: Record<string, string> = {
  fitness: '💪',
  nutrition: '🥗',
  learning: '📚',
  reading: '📖',
  career: '💼',
  creative: '🎨',
  social: '👥',
  mindfulness: '🧘',
  finance: '💰',
  other: '✨',
}

export default function MatchesPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { matches, loading: matchesLoading, sendMatchRequest } = useMatches()
  const router = useRouter()
  const supabase = createClient()
  const [myMatches, setMyMatches] = useState<(Match & { otherUser?: any })[]>([])
  const [loadingMyMatches, setLoadingMyMatches] = useState(true)
  const [view, setView] = useState<'discover' | 'my-matches'>('discover')

  useEffect(() => {
    if (!user) return

    const fetchMyMatches = async () => {
      try {
        setLoadingMyMatches(true)

        // Fetch all matches where user is involved
        const { data: matchesData, error: matchesError } = (await supabase
          .from('matches')
          .select('*')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order('matched_at', { ascending: false })) as any

        if (matchesError) throw matchesError

        // Fetch other users' details
        if (matchesData && matchesData.length > 0) {
          const otherUserIds = matchesData.map((match: Match) =>
            match.user1_id === user.id ? match.user2_id : match.user1_id
          )

          const { data: usersData, error: usersError } = (await supabase
            .from('users')
            .select('*')
            .in('id', otherUserIds)) as any

          if (usersError) throw usersError

          const usersMap = new Map((usersData || []).map((u: any) => [u.id, u]))

          const matchesWithUsers = matchesData.map((match: Match) => ({
            ...match,
            otherUser: usersMap.get(
              match.user1_id === user.id ? match.user2_id : match.user1_id
            ),
          }))

          setMyMatches(matchesWithUsers)
        } else {
          setMyMatches([])
        }
      } catch (error) {
        console.error('Error fetching my matches:', error)
      } finally {
        setLoadingMyMatches(false)
      }
    }

    fetchMyMatches()
  }, [user])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    router.push('/login')
    return null
  }

  const handleSendRequest = async (userId: string) => {
    const result = await sendMatchRequest(userId)
    if (result.error) {
      alert(`Failed to send request: ${result.error}`)
    } else {
      alert('Match request sent!')
    }
  }

  const handleAcceptMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        // @ts-expect-error - Supabase Update type inference issue
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', matchId)

      if (error) throw error

      // Refresh matches
      window.location.reload()
    } catch (error) {
      console.error('Error accepting match:', error)
      alert('Failed to accept match')
    }
  }

  const handleRejectMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        // @ts-expect-error - Supabase Update type inference issue
        .update({ status: 'rejected' })
        .eq('id', matchId)

      if (error) throw error

      // Refresh matches
      window.location.reload()
    } catch (error) {
      console.error('Error rejecting match:', error)
      alert('Failed to reject match')
    }
  }

  const pendingMatches = myMatches.filter(m => m.status === 'pending')
  const acceptedMatches = myMatches.filter(m => m.status === 'accepted')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="h-10 px-3"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Accountability Partners</h1>
                <p className="text-sm text-muted-foreground">
                  {view === 'discover' ? `${matches.length} potential matches` : `${myMatches.length} connections`}
                </p>
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setView('discover')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                view === 'discover'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => setView('my-matches')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                view === 'my-matches'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              My Matches ({myMatches.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {view === 'discover' ? (
          /* Discover View */
          matchesLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Finding your perfect accountability partners...</p>
            </div>
          ) : matches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No matches found</h3>
                <p className="text-muted-foreground mb-4">
                  Make sure your profile is complete and you have public goals set up!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => (
                <Card key={match.id} className="overflow-hidden hover:shadow-lg transition">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="w-16 h-16 border-2 border-white shadow-lg">
                        <AvatarImage src={match.user.avatar_url || ''} />
                        <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {match.user.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{match.user.full_name}</h3>
                        <p className="text-sm text-muted-foreground">@{match.user.username}</p>
                        {match.user.bio && (
                          <p className="text-sm text-muted-foreground mt-2">{match.user.bio}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {match.matchScore && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                              <Heart className="w-3 h-3 mr-1" />
                              {Math.round(match.matchScore)}% match
                            </Badge>
                          )}
                          {match.distance && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                              <MapPin className="w-3 h-3 mr-1" />
                              {match.distance.toFixed(1)} km away
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Goals */}
                    {match.goals.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Active Goals:</p>
                        <div className="space-y-2">
                          {match.goals.map((goal) => (
                            <div
                              key={goal.id}
                              className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                            >
                              <span className="text-xl">{CATEGORY_EMOJIS[goal.category] || '✨'}</span>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{goal.title}</p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {goal.frequency} • {goal.category}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => handleSendRequest(match.user.id)}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Send Match Request
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          /* My Matches View */
          loadingMyMatches ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your matches...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pending Requests */}
              {pendingMatches.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Pending Requests</h2>
                  <div className="space-y-3">
                    {pendingMatches.map((match) => (
                      <Card key={match.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={match.otherUser?.avatar_url || ''} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                  {match.otherUser?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '??'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{match.otherUser?.full_name}</p>
                                <p className="text-sm text-muted-foreground">@{match.otherUser?.username}</p>
                              </div>
                            </div>
                            {match.user2_id === user.id && (
                              <div className="flex gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => handleAcceptMatch(match.id)}
                                  className="h-9 w-9 border-green-300 text-green-700 hover:bg-green-50"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => handleRejectMatch(match.id)}
                                  className="h-9 w-9 border-red-300 text-red-700 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Accepted Matches */}
              {acceptedMatches.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Your Accountability Partners</h2>
                  <div className="space-y-3">
                    {acceptedMatches.map((match) => (
                      <Card key={match.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={match.otherUser?.avatar_url || ''} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                  {match.otherUser?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '??'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium">{match.otherUser?.full_name}</p>
                                <p className="text-sm text-muted-foreground">@{match.otherUser?.username}</p>
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => router.push(`/chat/${match.id}`)}
                              className="h-9 w-9"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {pendingMatches.length === 0 && acceptedMatches.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by discovering potential accountability partners!
                    </p>
                    <Button onClick={() => setView('discover')}>Discover Matches</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )
        )}
      </div>
    </div>
  )
}
