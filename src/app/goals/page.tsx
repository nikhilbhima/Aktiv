'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useGoals } from '@/hooks/useGoals'
import { Plus, Target, TrendingUp, Calendar, Edit2, Trash2, Play, Pause, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { GoalCategory, GoalFrequency, GoalStatus, GoalInsert } from '@/types/database.types'

const CATEGORY_DATA: { value: GoalCategory; label: string; emoji: string }[] = [
  { value: 'fitness', label: 'Fitness', emoji: '💪' },
  { value: 'nutrition', label: 'Nutrition', emoji: '🥗' },
  { value: 'learning', label: 'Learning', emoji: '📚' },
  { value: 'reading', label: 'Reading', emoji: '📖' },
  { value: 'career', label: 'Career', emoji: '💼' },
  { value: 'creative', label: 'Creative', emoji: '🎨' },
  { value: 'social', label: 'Social', emoji: '👥' },
  { value: 'mindfulness', label: 'Mindfulness', emoji: '🧘' },
  { value: 'finance', label: 'Finance', emoji: '💰' },
  { value: 'other', label: 'Other', emoji: '✨' },
]

const FREQUENCY_DATA: { value: GoalFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
]

const STATUS_COLORS: Record<GoalStatus, string> = {
  active: 'bg-green-100 text-green-800 border-green-300',
  paused: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  completed: 'bg-blue-100 text-blue-800 border-blue-300',
  abandoned: 'bg-gray-100 text-gray-800 border-gray-300',
}

export default function GoalsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { goals, loading: goalsLoading, createGoal, updateGoal, deleteGoal } = useGoals()
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [filter, setFilter] = useState<GoalStatus | 'all'>('all')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'fitness' as GoalCategory,
    frequency: 'daily' as GoalFrequency,
    frequency_count: 1,
    is_public: true,
  })

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

  const filteredGoals = filter === 'all' ? goals : goals.filter(g => g.status === filter)

  const handleCreateGoal = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a goal title')
      return
    }

    const goalData: Omit<GoalInsert, 'user_id'> = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      category: formData.category,
      frequency: formData.frequency,
      frequency_count: formData.frequency_count,
      is_public: formData.is_public,
      status: 'active',
      start_date: new Date().toISOString().split('T')[0],
    }

    const result = await createGoal(goalData as any)

    if (result.error) {
      alert(`Failed to create goal: ${result.error}`)
    } else {
      setIsCreating(false)
      setFormData({
        title: '',
        description: '',
        category: 'fitness',
        frequency: 'daily',
        frequency_count: 1,
        is_public: true,
      })
    }
  }

  const handleUpdateStatus = async (goalId: string, status: GoalStatus) => {
    const updates: any = { status }
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString()
    }

    const result = await updateGoal(goalId, updates)
    if (result.error) {
      alert(`Failed to update goal: ${result.error}`)
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return

    const result = await deleteGoal(goalId)
    if (result.error) {
      alert(`Failed to delete goal: ${result.error}`)
    }
  }

  const getCategoryEmoji = (category: GoalCategory) => {
    return CATEGORY_DATA.find(c => c.value === category)?.emoji || '✨'
  }

  const getProgressPercentage = (goal: typeof goals[0]) => {
    if (goal.frequency_count === 0) return 0
    return Math.min(100, Math.round((goal.total_checkins / goal.frequency_count) * 100))
  }

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
                <X className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">My Goals</h1>
                <p className="text-sm text-muted-foreground">{filteredGoals.length} goals</p>
              </div>
            </div>
            <Button
              onClick={() => setIsCreating(!isCreating)}
              className="h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Goal
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(['all', 'active', 'paused', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  filter === status
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Create Goal Form */}
        {isCreating && (
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Create New Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  placeholder="e.g., Run 5km every morning"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-12"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="What do you want to achieve?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as GoalCategory })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_DATA.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.emoji} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Frequency</label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value as GoalFrequency })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_DATA.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="is_public" className="text-sm">
                  Make this goal public (visible to potential accountability partners)
                </label>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 h-12"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateGoal}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Create Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goals List */}
        {goalsLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading goals...</p>
          </div>
        ) : filteredGoals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
              <p className="text-muted-foreground mb-4">
                {filter === 'all'
                  ? "Start by creating your first goal!"
                  : `No ${filter} goals found`}
              </p>
              {filter === 'all' && (
                <Button
                  onClick={() => setIsCreating(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Goal
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredGoals.map((goal) => (
              <Card key={goal.id} className="overflow-hidden hover:shadow-lg transition">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-3xl">{getCategoryEmoji(goal.category)}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">{goal.title}</h3>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="capitalize">
                            {goal.category}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {goal.frequency}
                          </Badge>
                          <Badge variant="outline" className={STATUS_COLORS[goal.status]}>
                            {goal.status}
                          </Badge>
                          {goal.is_public && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                              Public
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {goal.status === 'active' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdateStatus(goal.id, 'paused')}
                          title="Pause goal"
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                      )}
                      {goal.status === 'paused' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdateStatus(goal.id, 'active')}
                          title="Resume goal"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      {(goal.status === 'active' || goal.status === 'paused') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdateStatus(goal.id, 'completed')}
                          title="Mark as completed"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteGoal(goal.id)}
                        title="Delete goal"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{goal.current_streak}</p>
                      <p className="text-xs text-muted-foreground">Current Streak</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{goal.longest_streak}</p>
                      <p className="text-xs text-muted-foreground">Best Streak</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{goal.total_checkins}</p>
                      <p className="text-xs text-muted-foreground">Total Check-ins</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm font-bold text-blue-600">
                        {getProgressPercentage(goal)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${getProgressPercentage(goal)}%` }}
                      />
                    </div>
                  </div>

                  {/* Check-in Button */}
                  {goal.status === 'active' && (
                    <Button
                      className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      onClick={() => router.push(`/goals/${goal.id}`)}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Check In & View Details
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
