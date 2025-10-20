'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { mockChatThreads, currentUser } from '@/lib/mock-data';
import { motion } from 'framer-motion';

export function ChatView() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    mockChatThreads[0]?.id || null
  );
  const [messageInput, setMessageInput] = useState('');

  const selectedThread = mockChatThreads.find(
    (thread) => thread.id === selectedThreadId
  );

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

  if (mockChatThreads.length === 0) {
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
          {mockChatThreads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setSelectedThreadId(thread.id)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-accent/50 transition-colors border-b border-border/20 ${
                selectedThreadId === thread.id ? 'bg-accent/50' : ''
              }`}
            >
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage
                  src={thread.participant.avatar}
                  alt={thread.participant.name}
                />
                <AvatarFallback>
                  {thread.participant.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm truncate">
                    {thread.participant.name}
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
                  {thread.lastMessage.text}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTimestamp(thread.lastMessage.timestamp)}
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
            <div className="p-4 border-b border-border/40 flex items-center gap-3">
              {/* Mobile Back Button */}
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
                <AvatarImage
                  src={selectedThread.participant.avatar}
                  alt={selectedThread.participant.name}
                />
                <AvatarFallback>
                  {selectedThread.participant.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {selectedThread.participant.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedThread.participant.location}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedThread.messages.map((message, index) => {
                const isCurrentUser = message.senderId === currentUser.id;
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
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
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isCurrentUser
                            ? 'text-white/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
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
                    if (e.key === 'Enter' && messageInput.trim()) {
                      // TODO: Send message
                      console.log('Send:', messageInput);
                      setMessageInput('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (messageInput.trim()) {
                      // TODO: Send message
                      console.log('Send:', messageInput);
                      setMessageInput('');
                    }
                  }}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!messageInput.trim()}
                >
                  Send
                </button>
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
