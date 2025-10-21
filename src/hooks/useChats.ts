import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Match, Message, User } from '@/types/database.types';

interface ChatThread {
  match: Match;
  otherUser: User;
  messages: Message[];
  unreadCount: number;
  lastMessage: Message | null;
}

export function useChats() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchChats = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get all accepted matches for the current user
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'accepted')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (matchesError) throw matchesError;

      if (!matches || matches.length === 0) {
        setThreads([]);
        return;
      }

      // Extract all other user IDs and match IDs
      const otherUserIds = matches.map((match) =>
        match.user1_id === user.id ? match.user2_id : match.user1_id
      );
      const matchIds = matches.map((match) => match.id);

      // Batch fetch all users in one query
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('id', otherUserIds);

      if (usersError) throw usersError;

      // Batch fetch all messages in one query
      const { data: allMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .in('match_id', matchIds)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Create lookup maps
      const usersMap = new Map(
        (usersData || []).map((user) => [user.id, user])
      );
      const messagesByMatch = (allMessages || []).reduce((acc: any, message) => {
        if (!acc[message.match_id]) acc[message.match_id] = [];
        acc[message.match_id].push(message);
        return acc;
      }, {});

      // Build threads
      const threadsData = matches
        .map((match) => {
          const otherUserId =
            match.user1_id === user.id ? match.user2_id : match.user1_id;
          const otherUser = usersMap.get(otherUserId);

          if (!otherUser) return null; // Skip if user not found

          const messages = messagesByMatch[match.id] || [];

          // Count unread messages
          const unreadCount = messages.filter(
            (msg: Message) => !msg.is_read && msg.sender_id !== user.id
          ).length;

          // Get last message
          const lastMessage = messages.length > 0
            ? messages[messages.length - 1]
            : null;

          return {
            match,
            otherUser,
            messages,
            unreadCount,
            lastMessage,
          };
        })
        .filter((thread): thread is ChatThread => thread !== null);

      // Sort by last message time (most recent first)
      threadsData.sort((a, b) => {
        const aTime = a.lastMessage?.created_at || a.match.created_at;
        const bTime = b.lastMessage?.created_at || b.match.created_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setThreads(threadsData);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (!user) {
      setThreads([]);
      setLoading(false);
      return;
    }

    fetchChats();

    // Subscribe to real-time message updates
    // Filter by messages where we are a participant (via match)
    const channel = supabase
      .channel(`user-messages-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          // Note: We can't easily filter by match_id here without knowing all match IDs
          // RLS policies will ensure we only receive messages we're allowed to see
          // A better approach would be to subscribe per-thread, but that's complex
        },
        (payload) => {
          const newMessage = payload.new as Message;

          // Ignore temp messages (optimistic updates from our own sends)
          if (newMessage.id.startsWith('temp-')) {
            return;
          }

          // Only update if this message belongs to one of our threads
          setThreads((prev) => {
            const threadIndex = prev.findIndex(t => t.match.id === newMessage.match_id);
            if (threadIndex === -1) {
              // Message for a match we don't have loaded, ignore it
              return prev;
            }

            return prev.map((thread) => {
              if (thread.match.id === newMessage.match_id) {
                // Check if message already exists (avoid duplicates)
                const messageExists = thread.messages.some(m => m.id === newMessage.id);
                if (messageExists) return thread;

                // Also check if we have a temp message that should be replaced
                // This handles the case where optimistic update hasn't been replaced yet
                const hasTempMessage = thread.messages.some(m => m.id.startsWith('temp-'));
                if (hasTempMessage && newMessage.sender_id === user.id) {
                  // This is likely our own message coming back, but optimistic update hasn't replaced it yet
                  // Let the optimistic update handler replace it instead
                  return thread;
                }

                return {
                  ...thread,
                  messages: [...thread.messages, newMessage],
                  lastMessage: newMessage,
                  unreadCount:
                    newMessage.sender_id !== user.id
                      ? thread.unreadCount + 1
                      : thread.unreadCount,
                };
              }
              return thread;
            });
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchChats, supabase]);

  const sendMessage = async (matchId: string, content: string) => {
    if (!user) return { error: 'Not authenticated' };

    // Create optimistic message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      match_id: matchId,
      sender_id: user.id,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
      read_at: null,
    };

    // Optimistically add to UI
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.match.id === matchId) {
          return {
            ...thread,
            messages: [...thread.messages, optimisticMessage],
            lastMessage: optimisticMessage,
          };
        }
        return thread;
      })
    );

    try {
      // @ts-ignore - Type mismatch with Supabase generics
      const { data, error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: user.id,
          content,
          is_read: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic message with real one
      setThreads((prev) =>
        prev.map((thread) => {
          if (thread.match.id === matchId) {
            return {
              ...thread,
              messages: thread.messages.map((msg) =>
                msg.id === optimisticMessage.id ? data : msg
              ),
              lastMessage: data,
            };
          }
          return thread;
        })
      );

      return { data, error: null };
    } catch (err) {
      console.error('Error sending message:', err);

      // Rollback optimistic update
      setThreads((prev) =>
        prev.map((thread) => {
          if (thread.match.id === matchId) {
            const filteredMessages = thread.messages.filter(
              (msg) => msg.id !== optimisticMessage.id
            );
            return {
              ...thread,
              messages: filteredMessages,
              lastMessage:
                filteredMessages.length > 0
                  ? filteredMessages[filteredMessages.length - 1]
                  : null,
            };
          }
          return thread;
        })
      );

      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to send message',
      };
    }
  };

  const markAsRead = async (messageIds: string[]) => {
    if (!user || messageIds.length === 0) return;

    try {
      // @ts-ignore - Type mismatch with Supabase generics
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', messageIds)
        .neq('sender_id', user.id); // Only mark messages sent by others

      if (error) throw error;

      // Update local state AFTER confirming DB success
      setThreads((prev) =>
        prev.map((thread) => ({
          ...thread,
          messages: thread.messages.map((msg) =>
            messageIds.includes(msg.id) && msg.sender_id !== user.id
              ? { ...msg, is_read: true, read_at: new Date().toISOString() }
              : msg
          ),
          unreadCount: thread.messages.filter(
            (msg) =>
              !messageIds.includes(msg.id) &&
              !msg.is_read &&
              msg.sender_id !== user.id
          ).length,
        }))
      );
    } catch (err) {
      console.error('Error marking messages as read:', err);
      // Don't update local state if DB update failed
    }
  };

  const unmatch = async (matchId: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      // Update match status to blocked
      // @ts-ignore - Type mismatch with Supabase generics
      const { error } = await supabase
        .from('matches')
        .update({ status: 'blocked' })
        .eq('id', matchId);

      if (error) throw error;

      // Remove from local state AFTER confirming DB success
      setThreads((prev) => prev.filter((thread) => thread.match.id !== matchId));

      return { error: null };
    } catch (err) {
      console.error('Error unmatching:', err);
      return {
        error: err instanceof Error ? err.message : 'Failed to unmatch',
      };
    }
  };

  return {
    threads,
    loading,
    error,
    sendMessage,
    markAsRead,
    unmatch,
    refresh: fetchChats,
  };
}
