'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRequests } from '@/hooks/useRequests'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, X, User, MapPin, Target, ArrowLeft } from 'lucide-react'
import { useState } from 'react'

export default function RequestsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { requests, loading, acceptRequest, rejectRequest } = useRequests(user?.id)
  const [processing, setProcessing] = useState<string | null>(null)

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading requests...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const handleAccept = async (matchId: string) => {
    setProcessing(matchId)
    const result = await acceptRequest(matchId)
    if (result.success) {
      // Success notification will be shown by the hook
    }
    setProcessing(null)
  }

  const handleReject = async (matchId: string) => {
    setProcessing(matchId)
    await rejectRequest(matchId)
    setProcessing(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-orange-950/20">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Match Requests</h1>
            <p className="text-sm text-muted-foreground">
              {requests.length} pending {requests.length === 1 ? 'request' : 'requests'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">No pending requests</h2>
              <p className="text-muted-foreground mb-6">
                When someone wants to connect with you, their request will appear here.
              </p>
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="w-16 h-16 flex-shrink-0">
                      <AvatarImage src={request.requester.avatar_url || ''} />
                      <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                        {request.requester.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {request.requester.full_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            @{request.requester.username}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 text-xs font-medium">
                          {request.mode === 'accountability' ? (
                            <>
                              <Target className="w-3 h-3" />
                              <span>Accountability</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-3 h-3" />
                              <span>IRL</span>
                            </>
                          )}
                        </div>
                      </div>

                      {request.requester.bio && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {request.requester.bio}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleAccept(request.id)}
                          disabled={processing === request.id}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                        >
                          {processing === request.id ? (
                            'Processing...'
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Accept
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleReject(request.id)}
                          disabled={processing === request.id}
                          variant="outline"
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </div>

                      <p className="text-xs text-muted-foreground mt-3">
                        Requested {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
