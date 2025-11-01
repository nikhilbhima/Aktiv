'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ModeToggle } from '@/components/mode-toggle';
import { Sidebar } from '@/components/sidebar';
import { FeedView } from '@/components/feed-view';
import { ChatView } from '@/components/chat-view';
import { CalendarView } from '@/components/calendar-view';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, User, Target } from 'lucide-react';

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeView, setActiveView] = useState<'feed' | 'chat' | 'calendar'>('feed');
  const [showSidebar, setShowSidebar] = useState(false);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Logo className="w-16 h-16 mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3 md:gap-6">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden p-2 rounded-lg hover:bg-accent"
              aria-label="Toggle filters"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <Logo className="w-8 h-8 md:w-10 md:h-10" />
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                Aktiv
              </h1>
            </div>
          </div>

          <nav className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setActiveView('feed')}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors border ${
                activeView === 'feed'
                  ? 'bg-accent text-accent-foreground border-border/60'
                  : 'text-muted-foreground hover:text-foreground border-border/60'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => setActiveView('chat')}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors border ${
                activeView === 'chat'
                  ? 'bg-accent text-accent-foreground border-border/60'
                  : 'text-muted-foreground hover:text-foreground border-border/60'
              }`}
            >
              Chats
            </button>
            <button
              onClick={() => setActiveView('calendar')}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors border ${
                activeView === 'calendar'
                  ? 'bg-accent text-accent-foreground border-border/60'
                  : 'text-muted-foreground hover:text-foreground border-border/60'
              }`}
            >
              Calendar
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border/40">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/matches')}
                className="h-9 w-9"
                title="Matches"
              >
                <User className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/goals')}
                className="h-9 w-9"
                title="My Goals"
              >
                <Target className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/settings')}
                className="h-9 w-9"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/profile')}
                className="h-9 w-9 p-0"
                title="Profile"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {profile?.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '??'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Layout */}
      <div className="container flex gap-6 px-4 py-6 relative">
        {/* Mobile Sidebar Overlay */}
        {showSidebar && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Left Sidebar - Filters */}
        <div
          className={`
            lg:static lg:block
            fixed inset-y-0 left-0 z-50
            transform transition-transform duration-300
            ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <Sidebar onClose={() => setShowSidebar(false)} />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {activeView === 'feed' ? (
            <FeedView />
          ) : activeView === 'chat' ? (
            <ChatView />
          ) : (
            <CalendarView />
          )}
        </main>
      </div>
    </div>
  );
}
