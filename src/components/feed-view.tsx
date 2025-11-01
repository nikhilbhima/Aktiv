'use client';

import { useState } from 'react';
import { useMatches } from '@/hooks/useMatches';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface FeedViewProps {
  // No mode needed - unified feed
}

// DUMMY DATA FOR DESIGN PREVIEW
const DUMMY_MATCHES = {
  accountability: [
    {
      id: '1',
      user: {
        id: 'u1',
        full_name: 'Priya Sharma',
        username: 'priya_fitness',
        bio: 'Marketing professional on a fitness journey. Looking for someone to keep me accountable with early morning workouts!',
      },
      matchScore: 0.92,
      distance: null,
      goals: [
        { id: 'g1', title: 'Run 5km daily', category: 'fitness' },
        { id: 'g2', title: 'Read 30 mins before bed', category: 'reading' },
      ],
    },
    {
      id: '2',
      user: {
        id: 'u2',
        full_name: 'Rahul Verma',
        username: 'codeandcreate',
        bio: 'Full-stack dev trying to build consistent learning habits. Love discussing tech, books, and productivity!',
      },
      matchScore: 0.88,
      distance: null,
      goals: [
        { id: 'g3', title: 'Learn DSA - 2 problems daily', category: 'learning' },
        { id: 'g4', title: 'Side project - 1 hour daily', category: 'career' },
        { id: 'g5', title: 'Meditate 10 mins', category: 'mindfulness' },
      ],
    },
    {
      id: '3',
      user: {
        id: 'u3',
        full_name: 'Ananya Patel',
        username: 'mindful_ananya',
        bio: 'Yoga instructor & content creator. Passionate about wellness, plant-based nutrition, and mindful living.',
      },
      matchScore: 0.85,
      distance: null,
      goals: [
        { id: 'g6', title: 'Morning yoga practice', category: 'fitness' },
        { id: 'g7', title: 'Meal prep Sundays', category: 'nutrition' },
        { id: 'g8', title: 'Journal daily reflections', category: 'mindfulness' },
      ],
    },
    {
      id: '4',
      user: {
        id: 'u4',
        full_name: 'Karthik Reddy',
        username: 'finance_geek',
        bio: 'CA student. Goal: Clear exams + build wealth. Seeking accountability for study routine and investment habits.',
      },
      matchScore: 0.79,
      distance: null,
      goals: [
        { id: 'g9', title: 'Study 6 hours daily', category: 'learning' },
        { id: 'g10', title: 'Track expenses weekly', category: 'finance' },
      ],
    },
  ],
  irl: [
    {
      id: '5',
      user: {
        id: 'u5',
        full_name: 'Sneha Iyer',
        username: 'sneha_runs',
        bio: 'Marathon runner & coffee enthusiast. Always up for morning runs and post-workout breakfast!',
      },
      matchScore: 0.91,
      distance: 2.3,
      goals: [
        { id: 'g11', title: 'Morning runs 6 AM', category: 'fitness' },
        { id: 'g12', title: 'Explore new cafes', category: 'social' },
      ],
    },
    {
      id: '6',
      user: {
        id: 'u6',
        full_name: 'Arjun Mehta',
        username: 'gym_bro_blr',
        bio: 'Software engineer hitting the gym 6 days/week. Need a consistent gym buddy for evening sessions!',
      },
      matchScore: 0.87,
      distance: 4.1,
      goals: [
        { id: 'g13', title: 'Gym 6 PM - chest/back/legs', category: 'fitness' },
        { id: 'g14', title: 'Protein intake tracking', category: 'nutrition' },
      ],
    },
    {
      id: '7',
      user: {
        id: 'u7',
        full_name: 'Meera Shah',
        username: 'bookworm_meera',
        bio: 'Book club organizer. Let\'s grab chai and discuss fiction, philosophy, or productivity books!',
      },
      matchScore: 0.83,
      distance: 3.7,
      goals: [
        { id: 'g15', title: 'Weekend reading sessions', category: 'reading' },
        { id: 'g16', title: 'Host monthly book club', category: 'social' },
      ],
    },
  ],
};

export function FeedView({}: FeedViewProps) {
  // Using real data from Supabase
  const { matches, loading, error, sendMatchRequest } = useMatches();
  const [sendingRequestTo, setSendingRequestTo] = useState<string | null>(null);

  const handleSendRequest = async (userId: string) => {
    setSendingRequestTo(userId);
    const result = await sendMatchRequest(userId);
    if (result.error) {
      alert(`Error: ${result.error}`);
    } else {
      alert('Connection request sent!');
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
            We're finding people who share your goals and can keep you accountable. Try adjusting your filters or check back soon!
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-4 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-white/90 uppercase tracking-wider">Streak</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl md:text-4xl font-bold text-white">12</span>
              <span className="text-sm text-white/80">days</span>
            </div>
          </div>
        </motion.div>

        {/* Goals Completed Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-border/60 p-4 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Completed</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl md:text-4xl font-bold text-foreground">8</span>
              <span className="text-sm text-muted-foreground">goals</span>
            </div>
          </div>
        </motion.div>

        {/* Active Goals Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-border/60 p-4 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl md:text-4xl font-bold text-foreground">4</span>
              <span className="text-sm text-muted-foreground">goals</span>
            </div>
          </div>
        </motion.div>

        {/* Add Goal Button Card */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          onClick={() => alert('Add goal modal coming soon!')}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-orange-50/50 dark:from-zinc-900 dark:to-orange-950/20 border-2 border-dashed border-orange-300 dark:border-orange-700 hover:border-orange-400 dark:hover:border-orange-600 p-4 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">Add Goal</span>
          </div>
        </motion.button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            Discover Partners
          </h2>
          <p className="text-muted-foreground">
            {matches.length} {matches.length === 1 ? 'person' : 'people'} found
          </p>
        </div>
      </div>

      {/* Matches Feed - Vertical Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="h-full"
          >
            <div className="group relative h-full flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-white to-orange-50/30 dark:from-zinc-900 dark:to-orange-950/20 border border-orange-100 dark:border-orange-900/30 shadow-md hover:shadow-2xl hover:border-orange-200 dark:hover:border-orange-800/50 transition-all duration-300">
              {/* Match Score Badge */}
              {match.matchScore !== null && (
                <div className="absolute top-2 right-2 z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-md opacity-60"></div>
                    <div className="relative px-2.5 py-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-white text-xs font-bold shadow-lg">
                      {Math.round(match.matchScore * 100)}%
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 flex flex-col flex-1">
                {/* Avatar - Centered */}
                <div className="flex justify-center mb-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full blur-lg opacity-40 group-hover:opacity-70 transition-opacity"></div>
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl ring-4 ring-white/50 dark:ring-zinc-900/50">
                      {match.user.full_name?.charAt(0) || '?'}
                    </div>
                  </div>
                </div>

                {/* User Info - Centered */}
                <div className="text-center mb-2">
                  <h3 className="text-base font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent mb-0.5 line-clamp-1">
                    {match.user.full_name}
                  </h3>
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1.5">
                    @{match.user.username}
                  </p>

                  {/* Distance Badge (IRL mode) */}
                  {match.distance !== null && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 rounded-full text-xs font-medium text-orange-700 dark:text-orange-300">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {match.distance.toFixed(1)} km
                    </div>
                  )}
                </div>

                {/* Bio */}
                {match.user.bio && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3 line-clamp-2 text-center">
                    {match.user.bio}
                  </p>
                )}

                {/* Goals Section */}
                {match.goals.length > 0 && (
                  <div className="mb-3 flex-1">
                    <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 text-center">
                      Goals
                    </h4>
                    <div className="space-y-1">
                      {match.goals.slice(0, 3).map((goal) => (
                        <div
                          key={goal.id}
                          className="flex items-center gap-2 px-2.5 py-1 bg-white dark:bg-zinc-800 rounded-lg border border-orange-200 dark:border-orange-800/40 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-200"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shrink-0"></span>
                          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
                            {goal.title}
                          </span>
                        </div>
                      ))}
                      {match.goals.length > 3 && (
                        <p className="text-xs text-zinc-400 text-center pt-0.5">
                          +{match.goals.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Connect Button */}
                <Button
                  onClick={() => handleSendRequest(match.user.id)}
                  disabled={sendingRequestTo === match.user.id}
                  className="w-full h-10 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 mt-auto"
                >
                  {sendingRequestTo === match.user.id ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Connect
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
