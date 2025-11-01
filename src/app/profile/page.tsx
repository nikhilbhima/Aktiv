'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Camera, MapPin, Calendar, Link as LinkIcon, Instagram, Twitter, Linkedin, Globe, Edit2, Check, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { UserUpdate } from '@/types/database.types'

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    location_city: '',
    location_state: '',
    location_country: '',
    instagram_handle: '',
    twitter_handle: '',
    linkedin_url: '',
    website_url: '',
  })

  // Sync form data with profile when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        location_city: profile.location_city || '',
        location_state: profile.location_state || '',
        location_country: profile.location_country || '',
        instagram_handle: profile.instagram_handle || '',
        twitter_handle: profile.twitter_handle || '',
        linkedin_url: profile.linkedin_url || '',
        website_url: profile.website_url || '',
      })
    }
  }, [profile])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    router.push('/login')
    return null
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      setUploadingAvatar(true)

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        // @ts-expect-error - Supabase Update type inference issue
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      await refreshProfile()
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Failed to upload avatar. Please try again.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      setIsSaving(true)

      const updates: UserUpdate = {
        full_name: formData.full_name.trim(),
        username: formData.username.trim(),
        bio: formData.bio.trim() || null,
        location_city: formData.location_city.trim() || null,
        location_state: formData.location_state.trim() || null,
        location_country: formData.location_country.trim() || null,
        instagram_handle: formData.instagram_handle.trim() || null,
        twitter_handle: formData.twitter_handle.trim() || null,
        linkedin_url: formData.linkedin_url.trim() || null,
        website_url: formData.website_url.trim() || null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('users')
        // @ts-expect-error - Supabase Update type inference issue
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      await refreshProfile()
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setFormData({
      full_name: profile?.full_name || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
      location_city: profile?.location_city || '',
      location_state: profile?.location_state || '',
      location_country: profile?.location_country || '',
      instagram_handle: profile?.instagram_handle || '',
      twitter_handle: profile?.twitter_handle || '',
      linkedin_url: profile?.linkedin_url || '',
      website_url: profile?.website_url || '',
    })
    setIsEditing(false)
  }

  const getInitials = () => {
    return profile?.full_name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || '??'
  }

  const getLocationString = () => {
    const parts = [
      profile?.location_city,
      profile?.location_state,
      profile?.location_country,
    ].filter(Boolean)
    return parts.join(', ') || 'Location not set'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Mobile-First Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="h-10 px-3"
          >
            <X className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Profile</h1>
          {!isEditing ? (
            <Button
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="h-10 px-3"
            >
              <Edit2 className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="h-10 px-3"
            >
              <Check className="w-5 h-5 text-green-600" />
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Avatar Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition shadow-lg active:scale-95">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                  </label>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {!isEditing ? (
                <>
                  <div>
                    <h2 className="text-2xl font-bold">{profile?.full_name}</h2>
                    <p className="text-muted-foreground">@{profile?.username}</p>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {profile?.bio || 'No bio yet'}
                  </p>
                </>
              ) : (
                <div className="w-full space-y-3">
                  <Input
                    placeholder="Full Name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="h-12"
                  />
                  <Input
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="h-12"
                  />
                  <Textarea
                    placeholder="Bio (tell others about yourself)"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    maxLength={200}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.bio.length}/200
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{profile?.streak_days || 0}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{profile?.total_goals_completed || 0}</p>
                <p className="text-xs text-muted-foreground">Goals Done</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{profile?.total_checkins || 0}</p>
                <p className="text-xs text-muted-foreground">Check-ins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="w-5 h-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <p className="text-sm text-muted-foreground">{getLocationString()}</p>
            ) : (
              <div className="space-y-3">
                <Input
                  placeholder="City"
                  value={formData.location_city}
                  onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                  className="h-11"
                />
                <Input
                  placeholder="State/Province"
                  value={formData.location_state}
                  onChange={(e) => setFormData({ ...formData, location_state: e.target.value })}
                  className="h-11"
                />
                <Input
                  placeholder="Country"
                  value={formData.location_country}
                  onChange={(e) => setFormData({ ...formData, location_country: e.target.value })}
                  className="h-11"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Links Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LinkIcon className="w-5 h-5" />
              Social Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isEditing ? (
              <>
                {profile?.instagram_handle && (
                  <a
                    href={`https://instagram.com/${profile.instagram_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition active:scale-[0.98]"
                  >
                    <Instagram className="w-5 h-5 text-pink-600" />
                    <span className="text-sm">@{profile.instagram_handle}</span>
                  </a>
                )}
                {profile?.twitter_handle && (
                  <a
                    href={`https://twitter.com/${profile.twitter_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition active:scale-[0.98]"
                  >
                    <Twitter className="w-5 h-5 text-blue-500" />
                    <span className="text-sm">@{profile.twitter_handle}</span>
                  </a>
                )}
                {profile?.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition active:scale-[0.98]"
                  >
                    <Linkedin className="w-5 h-5 text-blue-700" />
                    <span className="text-sm">LinkedIn</span>
                  </a>
                )}
                {profile?.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition active:scale-[0.98]"
                  >
                    <Globe className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Website</span>
                  </a>
                )}
                {!profile?.instagram_handle && !profile?.twitter_handle && !profile?.linkedin_url && !profile?.website_url && (
                  <p className="text-sm text-muted-foreground">No social links added</p>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Instagram className="w-5 h-5 text-pink-600 flex-shrink-0" />
                  <Input
                    placeholder="Instagram username"
                    value={formData.instagram_handle}
                    onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Twitter className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <Input
                    placeholder="Twitter username"
                    value={formData.twitter_handle}
                    onChange={(e) => setFormData({ ...formData, twitter_handle: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Linkedin className="w-5 h-5 text-blue-700 flex-shrink-0" />
                  <Input
                    placeholder="LinkedIn URL"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <Input
                    placeholder="Website URL"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    className="h-11"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Account Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-5 h-5" />
              Account Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Email: {user.email}</p>
            <p>Joined: {new Date(profile?.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 pb-6">
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="flex-1 h-12"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
