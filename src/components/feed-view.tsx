'use client';

import { useState } from 'react';
import { useMatches } from '@/hooks/useMatches';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface FeedViewProps {
  mode: 'accountability' | 'irl';
}

export function FeedView({ mode }: FeedViewProps) {
  const { matches, loading, error, sendMatchRequest } = useMatches(mode);
  const [sendingRequestTo, setSendingRequestTo] = useState<string | null>(null);

  const handleSendRequest = async (userId: string) => {
    setSendingRequestTo(userId);
    const { error: requestError } = await sendMatchRequest(userId);
    if (requestError) {
      alert(`Error: ${requestError}`);
    }
    setSendingRequestTo(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-muted-foreground">Finding your matches...</p>
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

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-6">🔍</div>
          <h2 className="text-2xl font-semibold mb-2">
            No matches found yet
          </h2>
          <p className="text-muted-foreground max-w-md">
            {mode === 'irl'
              ? "We're looking for people near you with similar goals. Try adjusting your filters or expanding your distance range."
              : "We're finding people who share your goals and can keep you accountable. Check back soon!"}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            {mode === 'irl' ? 'Nearby Matches' : 'Accountability Partners'}
          </h2>
          <p className="text-muted-foreground">
            {matches.length} {matches.length === 1 ? 'person' : 'people'} found
          </p>
        </div>
      </div>

      {/* Matches Feed */}
      <div className="space-y-6">
        {matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div className="gradient-card rounded-2xl border border-border p-6 space-y-4">
              {/* User Profile Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-2xl font-bold">
                    {match.user.full_name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{match.user.full_name}</h3>
                    <p className="text-sm text-muted-foreground">@{match.user.username}</p>
                    {match.user.bio && (
                      <p className="text-sm mt-2 text-muted-foreground">{match.user.bio}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {match.matchScore !== null && (
                        <span className="text-orange-500 font-medium">
                          {Math.round(match.matchScore * 100)}% Match
                        </span>
                      )}
                      {match.distance !== null && (
                        <span>{match.distance.toFixed(1)} km away</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleSendRequest(match.user.id)}
                  disabled={sendingRequestTo === match.user.id}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                >
                  {sendingRequestTo === match.user.id ? 'Sending...' : 'Connect'}
                </Button>
              </div>

              {/* Matched Goals */}
              {match.goals.length > 0 && (
                <div className="pt-4 border-t border-border/40">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Active Goals
                  </h4>
                  <div className="space-y-2">
                    {match.goals.map((goal) => (
                      <div key={goal.id} className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        <span className="font-medium">{goal.title}</span>
                        <span className="text-muted-foreground">
                          ({goal.category})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
