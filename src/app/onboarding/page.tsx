'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import type { GoalCategory, GoalFrequency } from '@/types/database.types'

const CATEGORIES: { value: GoalCategory; label: string; emoji: string }[] = [
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

const FREQUENCIES: { value: GoalFrequency; label: string; description: string }[] = [
  { value: 'daily', label: 'Daily', description: 'Every day' },
  { value: 'weekly', label: 'Weekly', description: 'Once a week' },
  { value: 'monthly', label: 'Monthly', description: 'Once a month' },
  { value: 'custom', label: 'Custom', description: 'Set your own' },
]

export default function OnboardingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: Goal details
  const [goalTitle, setGoalTitle] = useState('')
  const [goalDescription, setGoalDescription] = useState('')
  const [category, setCategory] = useState<GoalCategory>('fitness')

  // Step 2: Frequency and visibility
  const [frequency, setFrequency] = useState<GoalFrequency>('daily')
  const [isPublic, setIsPublic] = useState(true)

  const handleNext = () => {
    if (step === 1) {
      if (!goalTitle.trim()) {
        setError('Please enter a goal title')
        return
      }
      setError(null)
      setStep(2)
    }
  }

  const handleBack = () => {
    setError(null)
    setStep(1)
  }

  const handleSkip = () => {
    router.push('/dashboard')
    router.refresh()
  }

  const handleComplete = async () => {
    if (!user) {
      setError('Not authenticated')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create the first goal
      const { error: goalError } = await supabase
        .from('goals')
        // @ts-ignore - Supabase type inference issues with Insert generics
        .insert({
          user_id: user.id,
          title: goalTitle.trim(),
          description: goalDescription.trim() || null,
          category,
          frequency,
          frequency_count: frequency === 'daily' ? 1 : frequency === 'weekly' ? 1 : frequency === 'monthly' ? 1 : 1,
          is_public: isPublic,
          status: 'active',
          start_date: new Date().toISOString().split('T')[0],
        })

      if (goalError) throw goalError

      // Update user onboarding status (if you have such a field)
      // For now, just redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      console.error('Error creating goal:', err)
      setError(err instanceof Error ? err.message : 'Failed to create goal')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-orange-950/20 flex flex-col">
      {/* Mobile-optimized layout */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Logo & Progress */}
          <div className="text-center">
            <div className="flex justify-center mb-3 sm:mb-4">
              <Logo className="w-14 h-14 sm:w-16 sm:h-16" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Welcome to Aktiv
            </h1>
            <p className="mt-2 text-sm text-muted-foreground px-4">
              Let's create your first goal
            </p>

            {/* Progress indicator */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className={`h-2 w-12 rounded-full transition-colors ${step >= 1 ? 'bg-orange-500' : 'bg-border'}`} />
              <div className={`h-2 w-12 rounded-full transition-colors ${step >= 2 ? 'bg-orange-500' : 'bg-border'}`} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Step {step} of 2</p>
          </div>

          {/* Onboarding Form - Mobile optimized */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-border/40 p-5 sm:p-6 space-y-5 sm:space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">What's your goal?</h2>

                {/* Goal Title */}
                <div>
                  <label htmlFor="goalTitle" className="block text-sm font-medium mb-2">
                    Goal Title
                  </label>
                  <input
                    id="goalTitle"
                    type="text"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="e.g., Run 5km"
                    maxLength={100}
                    disabled={loading}
                    className="w-full px-4 py-3.5 sm:py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-base"
                  />
                </div>

                {/* Goal Description */}
                <div>
                  <label htmlFor="goalDescription" className="block text-sm font-medium mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="goalDescription"
                    value={goalDescription}
                    onChange={(e) => setGoalDescription(e.target.value)}
                    placeholder="Add more details about your goal..."
                    rows={3}
                    maxLength={500}
                    disabled={loading}
                    className="w-full px-4 py-3.5 sm:py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-base resize-none"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        disabled={loading}
                        className={`p-3 rounded-xl border-2 transition-all text-left active:scale-95 ${
                          category === cat.value
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-border hover:border-orange-200'
                        }`}
                      >
                        <div className="text-2xl mb-1">{cat.emoji}</div>
                        <div className="text-sm font-medium">{cat.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">How often?</h2>

                {/* Frequency Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Frequency</label>
                  <div className="space-y-2">
                    {FREQUENCIES.map((freq) => (
                      <button
                        key={freq.value}
                        type="button"
                        onClick={() => setFrequency(freq.value)}
                        disabled={loading}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left active:scale-[0.98] ${
                          frequency === freq.value
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-border hover:border-orange-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{freq.label}</div>
                            <div className="text-sm text-muted-foreground">{freq.description}</div>
                          </div>
                          {frequency === freq.value && (
                            <div className="text-orange-500">✓</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visibility Toggle */}
                <div className="p-4 rounded-xl border border-border bg-background">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Make goal public</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Others can see this goal and match with you
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPublic(!isPublic)}
                      disabled={loading}
                      className={`relative w-12 h-7 rounded-full transition-colors active:scale-95 ${
                        isPublic ? 'bg-orange-500' : 'bg-border'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                          isPublic ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {step === 1 ? (
                <>
                  <Button
                    type="button"
                    onClick={handleSkip}
                    variant="outline"
                    disabled={loading}
                    className="flex-1 h-12 sm:h-11 rounded-xl text-base active:scale-[0.98]"
                  >
                    Skip for now
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={loading}
                    className="flex-1 h-12 sm:h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg text-base active:scale-[0.98]"
                  >
                    Next
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    onClick={handleBack}
                    variant="outline"
                    disabled={loading}
                    className="flex-1 h-12 sm:h-11 rounded-xl text-base active:scale-[0.98]"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleComplete}
                    disabled={loading}
                    className="flex-1 h-12 sm:h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg text-base active:scale-[0.98]"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      'Complete'
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Hidden on mobile */}
      <div className="hidden sm:block py-4 text-center text-xs text-muted-foreground">
        <p>© 2025 Aktiv. Build accountability, together.</p>
      </div>
    </div>
  )
}
