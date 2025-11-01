'use client'

import { Bell, Check, Trash2, User, MessageCircle, Calendar, Users } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Notification } from '@/hooks/useNotifications'

export function NotificationsDropdown() {
  const { user } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(user?.id)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'match_request':
        return <User className="w-5 h-5 text-blue-600" />
      case 'match_accepted':
        return <Check className="w-5 h-5 text-green-600" />
      case 'new_message':
        return <MessageCircle className="w-5 h-5 text-orange-600" />
      case 'check_in_reminder':
        return <Calendar className="w-5 h-5 text-purple-600" />
      case 'activity_invite':
        return <Users className="w-5 h-5 text-amber-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }

    // Navigate based on type
    switch (notification.type) {
      case 'match_request':
        router.push('/dashboard?tab=discover')
        break
      case 'match_accepted':
        router.push('/dashboard?tab=chats')
        break
      case 'new_message':
        if (notification.related_id) {
          router.push(`/chat/${notification.related_id}`)
        }
        break
      case 'activity_invite':
        if (notification.related_id) {
          router.push(`/activities/${notification.related_id}`)
        }
        break
      default:
        router.push('/dashboard')
    }

    setIsOpen(false)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-border z-50 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {unreadCount} unread
                </p>
              )}
            </div>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading && (
              <div className="p-8 text-center text-muted-foreground">
                Loading notifications...
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground text-sm">
                  No notifications yet
                </p>
              </div>
            )}

            {!loading && notifications.length > 0 && (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-accent/50 transition-colors cursor-pointer relative ${
                      !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm leading-tight">
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-border text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsOpen(false)
                  router.push('/notifications')
                }}
                className="text-xs w-full"
              >
                View All Notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
