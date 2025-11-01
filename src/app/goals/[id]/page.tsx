'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, TrendingUp, Calendar, Flame, Award, Camera, Smile, Frown, Meh, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import type { Goal, Checkin, CheckinMood } from '@/types/database.types'

const MOOD_OPTIONS: { value: CheckinMood; label: string; emoji: string; color: string }[] = [
  { value: 'great', label: 'Great', emoji: '😄', color: 'bg-green-100 border-green-500 text-green-700' },
  { value: 'good', label: 'Good', emoji: '🙂', color: 'bg-blue-100 border-blue-500 text-blue-700' },
  { value: 'okay', label: 'Okay', emoji: '😐', color: 'bg-yellow-100 border-yellow-500 text-yellow-700' },
  { value: 'struggling', label: 'Struggling', emoji: '😔', color: 'bg-orange-100 border-orange-500 text-orange-700' },
]

export default function GoalDetailsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const goalId = params.id as string

  const [goal, setGoal] = useState<Goal | null>(null)
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [isCheckInFormOpen, setIsCheckInFormOpen] = useState(false)

  // Check-in form state
  const [checkInData, setCheckInData] = useState({
    note: '',
    mood: 'good' as CheckinMood,
    proof_url: null as string | null,
  })

  useEffect(() => {
    if (!user || !goalId) return

    const fetchGoalAndCheckins = async () => {
      try {
        setLoading(true)

        // Fetch goal
        const { data: goalData, error: goalError } = await supabase
          .from('goals')
          .select('*')
          .eq('id', goalId)
          .eq('user_id', user.id)
          .single()

        if (goalError) throw goalError
        setGoal(goalData)

        // Fetch check-ins
        const { data: checkinsData, error: checkinsError } = (await supabase
          .from('checkins')
          .select('*')
          .eq('goal_id', goalId)
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })) as any

        if (checkinsError) throw checkinsError
        setCheckins(checkinsData || [])
      } catch (error) {
        console.error('Error fetching goal:', error)
        alert('Failed to load goal details')
      } finally {
        setLoading(false)
      }
    }

    fetchGoalAndCheckins()
  }, [user, goalId, supabase])

  const handleCheckIn = async () => {
    if (!user || !goal) return

    try {
      setCheckingIn(true)

      // Create check-in
      const { data: checkinData, error: checkinError } = await supabase
        .from('checkins')
        // @ts-expect-error - Supabase Insert type inference issue
        .insert({
          goal_id: goal.id,
          user_id: user.id,
          note: checkInData.note.trim() || null,
          mood: checkInData.mood,
          proof_url: checkInData.proof_url,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (checkinError) throw checkinError

      // Calculate new streak
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const lastCheckin = checkins[0]
      const lastCheckinDate = lastCheckin ? new Date(lastCheckin.completed_at).toISOString().split('T')[0] : null

      let newStreak = 1
      if (lastCheckinDate === yesterday) {
        newStreak = (goal.current_streak || 0) + 1
      } else if (lastCheckinDate === today) {
        newStreak = goal.current_streak || 1
      }

      // Update goal stats
      const { error: updateError } = await supabase
        .from('goals')
        // @ts-expect-error - Supabase Update type inference issue
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(goal.longest_streak || 0, newStreak),
          total_checkins: (goal.total_checkins || 0) + 1,
        })
        .eq('id', goal.id)

      if (updateError) throw updateError

      // Update local state
      setGoal({
        ...goal,
        current_streak: newStreak,
        longest_streak: Math.max(goal.longest_streak || 0, newStreak),
        total_checkins: (goal.total_checkins || 0) + 1,
      })
      setCheckins([checkinData as any, ...checkins])
      setIsCheckInFormOpen(false)
      setCheckInData({ note: '', mood: 'good', proof_url: null })

      alert('Check-in recorded! Keep up the great work!')
    } catch (error) {
      console.error('Error checking in:', error)
      alert('Failed to record check-in. Please try again.')
    } finally {
      setCheckingIn(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading goal...</p>
        </div>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Goal not found</p>
          <Button onClick={() => router.push('/goals')}>Back to Goals</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="h-10 px-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Goal Details</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Goal Header */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-2">{goal.title}</h2>
            {goal.description && (
              <p className="text-muted-foreground mb-4">{goal.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Started {new Date(goal.start_date).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <p className="text-3xl font-bold text-orange-600">{goal.current_streak || 0}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <p className="text-3xl font-bold text-purple-600">{goal.longest_streak || 0}</p>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-3xl font-bold text-blue-600">{goal.total_checkins || 0}</p>
              <p className="text-xs text-muted-foreground">Check-ins</p>
            </CardContent>
          </Card>
        </div>

        {/* Check-in Button */}
        {goal.status === 'active' && (
          <Button
            onClick={() => setIsCheckInFormOpen(!isCheckInFormOpen)}
            className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Check In Today
          </Button>
        )}

        {/* Check-in Form */}
        {isCheckInFormOpen && (
          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg">Record Your Check-In</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">How are you feeling?</label>
                <div className="grid grid-cols-2 gap-3">
                  {MOOD_OPTIONS.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setCheckInData({ ...checkInData, mood: mood.value })}
                      className={`p-4 rounded-lg border-2 transition text-center ${
                        checkInData.mood === mood.value
                          ? mood.color
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-1">{mood.emoji}</div>
                      <div className="text-sm font-medium">{mood.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                <Textarea
                  placeholder="How did it go? Any challenges or wins?"
                  value={checkInData.note}
                  onChange={(e) => setCheckInData({ ...checkInData, note: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCheckInFormOpen(false)
                    setCheckInData({ note: '', mood: 'good', proof_url: null })
                  }}
                  disabled={checkingIn}
                  className="flex-1 h-12"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {checkingIn ? 'Saving...' : 'Complete Check-In'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Check-ins History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Check-In History</CardTitle>
          </CardHeader>
          <CardContent>
            {checkins.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No check-ins yet</p>
                <p className="text-sm text-muted-foreground">Complete your first check-in to start tracking progress!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {checkins.map((checkin) => {
                  const moodData = MOOD_OPTIONS.find(m => m.value === checkin.mood)
                  return (
                    <div
                      key={checkin.id}
                      className="p-4 rounded-lg bg-muted/50 border border-border/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {moodData && (
                            <span className="text-2xl">{moodData.emoji}</span>
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              {new Date(checkin.completed_at).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(checkin.completed_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        {moodData && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${moodData.color}`}>
                            {moodData.label}
                          </span>
                        )}
                      </div>
                      {checkin.note && (
                        <p className="text-sm text-muted-foreground mt-2">{checkin.note}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
