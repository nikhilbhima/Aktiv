'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ModeToggle } from '@/components/mode-toggle';
import { Sidebar } from '@/components/sidebar';
import { FeedView } from '@/components/feed-view';
import { ChatView } from '@/components/chat-view';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'accountability' | 'irl'>('accountability');
  const [activeView, setActiveView] = useState<'feed' | 'chat'>('feed');
  const [showSidebar, setShowSidebar] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Sync mode with user profile
  useEffect(() => {
    if (profile) {
      setMode(profile.accountability_mode ? 'accountability' : 'irl');
    }
  }, [profile]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user || !profile) {
    return null;
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

            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Aktiv
            </h1>
            <div className="hidden md:block">
              <ModeToggle mode={mode} onModeChange={setMode} />
            </div>
          </div>

          <nav className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setActiveView('feed')}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                activeView === 'feed'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => setActiveView('chat')}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                activeView === 'chat'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Chats
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border/40">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium">{profile.full_name}</span>
                <span className="text-xs text-muted-foreground">@{profile.username}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-xs"
              >
                Sign Out
              </Button>
            </div>
          </nav>
        </div>

        {/* Mobile Mode Toggle */}
        <div className="md:hidden border-t border-border/40 px-4 py-3">
          <ModeToggle mode={mode} onModeChange={setMode} />
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
          <Sidebar mode={mode} onClose={() => setShowSidebar(false)} />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {activeView === 'feed' ? (
            <FeedView mode={mode} />
          ) : (
            <ChatView />
          )}
        </main>
      </div>
    </div>
  );
}
