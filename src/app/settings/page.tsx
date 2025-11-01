'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Settings,
  Bell,
  Shield,
  MapPin,
  Users,
  LogOut,
  ChevronRight,
  Lock,
  Eye,
  EyeOff,
  Target,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { GoalCategory, UserUpdate } from '@/types/database.types'

export default function SettingsPage() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Preferences state
  const [accountabilityMode, setAccountabilityMode] = useState(false)
  const [maxDistance, setMaxDistance] = useState(50)
  const [preferredCategories, setPreferredCategories] = useState<GoalCategory[]>([])

  // Sync preferences with profile when profile loads
  useEffect(() => {
    if (profile) {
      setAccountabilityMode(profile.accountability_mode || false)
      setMaxDistance(profile.max_distance_km || 50)
      setPreferredCategories((profile.preferred_categories as GoalCategory[]) || [])
    }
  }, [profile])

  // Password change state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    router.push('/login')
    return null
  }

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true)

      const updates: UserUpdate = {
        accountability_mode: accountabilityMode,
        max_distance_km: maxDistance,
        preferred_categories: preferredCategories,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('users')
        // @ts-expect-error - Supabase Update type inference issue
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      await refreshProfile()
      alert('Preferences saved successfully!')
      setActiveSection(null)
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Failed to save preferences. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters long.')
      return
    }

    try {
      setIsSaving(true)

      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      })

      if (error) throw error

      alert('Password changed successfully!')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setActiveSection(null)
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Failed to change password. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut()
      router.push('/login')
    }
  }

  const toggleCategory = (category: GoalCategory) => {
    setPreferredCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const CATEGORIES: { value: GoalCategory; label: string; icon: string }[] = [
    { value: 'fitness', label: 'Fitness', icon: '💪' },
    { value: 'nutrition', label: 'Nutrition', icon: '🥗' },
    { value: 'learning', label: 'Learning', icon: '📚' },
    { value: 'reading', label: 'Reading', icon: '📖' },
    { value: 'career', label: 'Career', icon: '💼' },
    { value: 'creative', label: 'Creative', icon: '🎨' },
    { value: 'social', label: 'Social', icon: '👥' },
    { value: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
    { value: 'finance', label: 'Finance', icon: '💰' },
    { value: 'other', label: 'Other', icon: '✨' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Mobile-First Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => activeSection ? setActiveSection(null) : router.back()}
            className="h-10 px-3"
          >
            <X className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">
            {activeSection ? activeSection : 'Settings'}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {!activeSection ? (
          <div className="space-y-4">
            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <button
                  onClick={() => router.push('/profile')}
                  className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Edit Profile</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
                <button
                  onClick={() => setActiveSection('Security')}
                  className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Change Password</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>

            {/* Matching Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Matching Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <button
                  onClick={() => setActiveSection('Match Preferences')}
                  className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Accountability Mode</p>
                      <p className="text-xs text-muted-foreground">
                        {profile?.accountability_mode ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
                <button
                  onClick={() => setActiveSection('Match Preferences')}
                  className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Max Distance</p>
                      <p className="text-xs text-muted-foreground">
                        {profile?.max_distance_km} km
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
                <button
                  onClick={() => setActiveSection('Match Preferences')}
                  className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-muted-foreground" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Preferred Categories</p>
                      <p className="text-xs text-muted-foreground">
                        {(profile?.preferred_categories as GoalCategory[])?.length || 0} selected
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>

            {/* Sign Out */}
            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="w-full h-12 mt-6"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : activeSection === 'Security' ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="current-password" className="text-sm font-medium">Current Password</label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      className="h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="new-password" className="text-sm font-medium">New Password</label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      className="h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium">Confirm New Password</label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    className="h-12"
                  />
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={
                    isSaving ||
                    !passwordForm.newPassword ||
                    !passwordForm.confirmPassword
                  }
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSaving ? 'Changing Password...' : 'Change Password'}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : activeSection === 'Match Preferences' ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Accountability Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    When enabled, you'll be matched with users who have similar goals for mutual accountability.
                  </p>
                  <button
                    onClick={() => setAccountabilityMode(!accountabilityMode)}
                    className={`w-full p-4 rounded-lg border-2 transition ${
                      accountabilityMode
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-muted bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {accountabilityMode ? 'Enabled' : 'Disabled'}
                      </span>
                      <div
                        className={`w-12 h-6 rounded-full transition ${
                          accountabilityMode ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition transform ${
                            accountabilityMode ? 'translate-x-6' : 'translate-x-0.5'
                          } mt-0.5`}
                        />
                      </div>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Maximum Distance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Set the maximum distance for finding IRL activity partners near you.
                  </p>
                  <div className="space-y-2">
                    <label htmlFor="max-distance" className="text-sm font-medium block mb-2">Distance: {maxDistance} km</label>
                    <input
                      id="max-distance"
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={maxDistance}
                      onChange={(e) => setMaxDistance(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5 km</span>
                      <span>100 km</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preferred Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select the goal categories you're most interested in. We'll prioritize matches in these areas.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => toggleCategory(category.value)}
                        className={`p-4 rounded-lg border-2 transition text-left ${
                          preferredCategories.includes(category.value)
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-muted bg-white'
                        }`}
                      >
                        <div className="text-2xl mb-2">{category.icon}</div>
                        <div className="text-sm font-medium">{category.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleSavePreferences}
              disabled={isSaving}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
