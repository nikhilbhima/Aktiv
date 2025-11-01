'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Match, Message, User } from '@/types/database.types'

export default function ChatPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const matchId = params.matchId as string
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [match, setMatch] = useState<Match | null>(null)
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetch match and messages
  useEffect(() => {
    if (!user || !matchId) return

    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch match
        const { data: matchData, error: matchError } = (await supabase
          .from('matches')
          .select('*')
          .eq('id', matchId)
          .single()) as any

        if (matchError) throw matchError
        setMatch(matchData as Match)

        // Determine other user
        const otherUserId = (matchData as Match).user1_id === user.id ? (matchData as Match).user2_id : (matchData as Match).user1_id

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', otherUserId)
          .single()

        if (userError) throw userError
        setOtherUser(userData as User)

        // Fetch messages
        const { data: messagesData, error: messagesError } = (await supabase
          .from('messages')
          .select('*')
          .eq('match_id', matchId)
          .order('sent_at', { ascending: true })) as any

        if (messagesError) throw messagesError
        setMessages(messagesData || [])

        // Mark messages as read
        if (messagesData && messagesData.length > 0) {
          await supabase
            .from('messages')
            // @ts-expect-error - Supabase Update type inference issue
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('match_id', matchId)
            .eq('sender_id', otherUserId)
            .eq('is_read', false)
        }
      } catch (error) {
        console.error('Error fetching chat:', error)
        alert('Failed to load chat')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, matchId])

  // Set up real-time subscription
  useEffect(() => {
    if (!user || !matchId) return

    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          // Only add if it's not from us (avoid duplicates)
          if (newMessage.sender_id !== user.id) {
            setMessages((prev) => [...prev, newMessage])

            // Mark as read
            supabase
              .from('messages')
              // @ts-expect-error - Supabase Update type inference issue
              .update({ is_read: true, read_at: new Date().toISOString() })
              .eq('id', newMessage.id)
              .then(() => {})
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, matchId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !messageText.trim() || sending) return

    try {
      setSending(true)

      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        match_id: matchId,
        sender_id: user.id,
        content: messageText.trim(),
        is_read: false,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        read_at: null,
      }

      // Add optimistically
      setMessages((prev) => [...prev, optimisticMessage])
      setMessageText('')

      const { data, error } = await supabase
        .from('messages')
        // @ts-expect-error - Supabase Insert type inference issue
        .insert({
          match_id: matchId,
          sender_id: user.id,
          content: messageText.trim(),
        })
        .select()
        .single()

      if (error) throw error

      // Replace temp message with real one
      setMessages((prev) =>
        prev.map((msg) => (msg.id === optimisticMessage.id ? (data as Message) : msg))
      )
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (!match || !otherUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Chat not found</p>
          <Button onClick={() => router.push('/matches')}>Back to Matches</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="h-10 px-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src={otherUser.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {otherUser.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '??'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-semibold">{otherUser.full_name}</h2>
            <p className="text-xs text-muted-foreground">@{otherUser.username}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">No messages yet</p>
            <p className="text-sm text-muted-foreground">Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isMe = message.sender_id === user?.id
              return (
                <div
                  key={message.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isMe
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${isMe ? 'text-blue-100' : 'text-muted-foreground'}`}>
                      {new Date(message.sent_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t sticky bottom-0">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 h-12"
              disabled={sending}
            />
            <Button
              type="submit"
              disabled={!messageText.trim() || sending}
              className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
