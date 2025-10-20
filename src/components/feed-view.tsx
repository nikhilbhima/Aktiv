'use client';

import { ProfileCard } from '@/components/profile-card';
import { GoalCard } from '@/components/goal-card';
import { mockMatches } from '@/lib/mock-data';
import { motion } from 'framer-motion';

interface FeedViewProps {
  mode: 'accountability' | 'irl';
}

export function FeedView({ mode }: FeedViewProps) {
  // Filter matches based on mode
  const filteredMatches = mockMatches.filter((match) => {
    if (mode === 'irl') {
      return match.matchedGoals.some((goal) => goal.isIRL);
    }
    return true; // Show all in accountability mode
  });

  if (filteredMatches.length === 0) {
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
            {filteredMatches.length} {filteredMatches.length === 1 ? 'person' : 'people'} found
          </p>
        </div>
      </div>

      {/* Matches Feed */}
      <div className="space-y-6">
        {filteredMatches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div className="space-y-4">
              {/* Profile Card */}
              <ProfileCard
                user={match.user}
                showDistance={mode === 'irl'}
                distance={match.distance}
                matchScore={match.matchScore}
                onMessageClick={() => {
                  // TODO: Open chat
                  console.log('Message', match.user.name);
                }}
              />

              {/* Matched Goals */}
              <div className="ml-6 pl-6 border-l-2 border-orange-500/20">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Matched Goals
                </h4>
                <div className="space-y-3">
                  {match.matchedGoals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} compact />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More (placeholder) */}
      <div className="flex justify-center pt-8">
        <button className="px-6 py-2 rounded-lg border border-border/40 text-sm font-medium hover:border-orange-500/30 transition-colors">
          Load more matches
        </button>
      </div>
    </div>
  );
}
