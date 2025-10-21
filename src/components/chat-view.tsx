'use client';

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useChats } from '@/hooks/useChats';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export function ChatView() {
  const { user } = useAuth();
  const { threads, loading, error, sendMessage, markAsRead, unmatch } = useChats();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return null;
    }
    return threads[0]?.match.id || null;
  });
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedThread = threads.find(
    (thread) => thread.match.id === selectedThreadId
  );

  // Auto-select first thread on desktop when threads load
  useEffect(() => {
    if (!selectedThreadId && threads.length > 0 && window.innerWidth >= 768) {
      setSelectedThreadId(threads[0].match.id);
    }
  }, [threads, selectedThreadId]);

  // Mark messages as read when thread is selected
  useEffect(() => {
    if (selectedThread && selectedThread.unreadCount > 0) {
      const unreadMessageIds = selectedThread.messages
        .filter((msg) => !msg.is_read && msg.sender_id !== user?.id)
        .map((msg) => msg.id);
      if (unreadMessageIds.length > 0) {
        markAsRead(unreadMessageIds);
      }
    }
  }, [selectedThreadId, selectedThread]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedThread?.messages]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedThreadId) return;

    setSending(true);
    const { error: sendError } = await sendMessage(
      selectedThreadId,
      messageInput.trim()
    );

    if (sendError) {
      alert(`Error: ${sendError}`);
    } else {
      setMessageInput('');
    }
    setSending(false);
  };

  const handleUnmatch = async (matchId: string) => {
    if (confirm('Are you sure you want to unmatch? This action cannot be undone.')) {
      const { error: unmatchError } = await unmatch(matchId);
      if (unmatchError) {
        alert(`Error: ${unmatchError}`);
      } else {
        setSelectedThreadId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-2xl font-semibold mb-2 text-red-500">Error</h2>
        <p className="text-muted-foreground max-w-md">{error}</p>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-6">💬</div>
          <h2 className="text-2xl font-semibold mb-2">No messages yet</h2>
          <p className="text-muted-foreground max-w-md">
            Start connecting with accountability partners and the conversation will
            appear here. Your journey is better with others!
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Thread List */}
      <div className={`${selectedThreadId ? 'hidden md:block' : 'block'} md:col-span-1 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col`}>
        <div className="p-4 border-b border-border/40">
          <h2 className="font-semibold text-lg">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {threads.map((thread) => (
            <button
              key={thread.match.id}
              onClick={() => setSelectedThreadId(thread.match.id)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-accent/50 transition-colors border-b border-border/20 ${
                selectedThreadId === thread.match.id ? 'bg-accent/50' : ''
              }`}
            >
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                  {thread.otherUser.full_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm truncate">
                    {thread.otherUser.full_name}
                  </h3>
                  {thread.unreadCount > 0 && (
                    <Badge
                      variant="default"
                      className="bg-orange-500 text-xs h-5 min-w-5 px-1.5"
                    >
                      {thread.unreadCount}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {thread.lastMessage?.content || 'No messages yet'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {thread.lastMessage
                    ? formatTimestamp(thread.lastMessage.created_at)
                    : ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`${selectedThreadId ? 'block' : 'hidden md:block'} md:col-span-2 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col`}>
        {selectedThread ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedThreadId(null)}
                  className="md:hidden p-2 -ml-2 rounded-lg hover:bg-accent"
                  aria-label="Back to messages"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                    {selectedThread.otherUser.full_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {selectedThread.otherUser.full_name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    @{selectedThread.otherUser.username}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUnmatch(selectedThread.match.id)}
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
              >
                Unmatch
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedThread.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No messages yet. Say hi!
                </div>
              ) : (
                selectedThread.messages.map((message, index) => {
                  const isCurrentUser = message.sender_id === user?.id;
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                      className={`flex ${
                        isCurrentUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isCurrentUser
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                            : 'bg-accent text-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isCurrentUser
                              ? 'text-white/70'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {formatTimestamp(message.created_at)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border/40">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 rounded-lg bg-accent border border-border/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !sending) {
                      handleSendMessage();
                    }
                  }}
                  disabled={sending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sending}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                >
                  {sending ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
