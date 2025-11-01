'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useGoals } from '@/hooks/useGoals';
import { useCheckins } from '@/hooks/useCheckins';
import { GoalDialog } from '@/components/goal-dialog';
import { CheckinDialog } from '@/components/checkin-dialog';
import type { Goal } from '@/types/database.types';

interface SidebarProps {
  onClose?: () => void;
}

type Category = string;

// Merged categories - all activities in one unified list
const allCategories: { value: Category; label: string; icon: string }[] = [
  // Learning & Skills
  { value: 'exam_prep', label: 'Exam Prep', icon: '📝' },
  { value: 'learning_coding', label: 'Learning Coding', icon: '💻' },
  { value: 'acquiring_skills', label: 'Acquiring Skills', icon: '🎨' },
  { value: 'daily_studying', label: 'Daily Studying', icon: '📚' },
  { value: 'upskilling', label: 'Upskilling', icon: '🧐' },
  { value: 'job_prep', label: 'Job Preparation', icon: '💼' },
  { value: 'reading', label: 'Reading', icon: '📖' },

  // Fitness & Sports
  { value: 'gym', label: 'Gym', icon: '🏋️' },
  { value: 'running', label: 'Running', icon: '🏃' },
  { value: 'yoga', label: 'Yoga', icon: '🧘' },
  { value: 'cycling', label: 'Cycling', icon: '🚴' },
  { value: 'swimming', label: 'Swimming', icon: '🏊' },
  { value: 'martial_arts', label: 'Martial Arts', icon: '🥋' },
  { value: 'basketball', label: 'Basketball', icon: '⛹️' },
  { value: 'football', label: 'Football', icon: '⚽' },
  { value: 'cricket', label: 'Cricket', icon: '🏏' },
  { value: 'badminton', label: 'Badminton', icon: '🏸' },
  { value: 'boxing', label: 'Boxing', icon: '🥊' },
  { value: 'hiking', label: 'Hiking', icon: '⛺' },
  { value: 'calisthenics', label: 'Calisthenics', icon: '🤸‍♂️' },

  // Health & Wellness
  { value: 'health', label: 'Health', icon: '💪' },
  { value: 'diet', label: 'Diet', icon: '🥗' },
  { value: 'wellness', label: 'Wellness', icon: '🧘' },
  { value: 'spiritual', label: 'Spiritual', icon: '🔮' },

  // Personal Development
  { value: 'building_routines', label: 'Building Routines', icon: '⏰' },
  { value: 'positive_habits', label: 'Positive Habits', icon: '🌟' },
  { value: 'self_improvement', label: 'Self-Improvement', icon: '🌱' },
  { value: 'breaking_bad_habits', label: 'Breaking Bad Habits', icon: '🚭' },
  { value: 'managing_adhd', label: 'Managing ADHD', icon: '🧠' },
  { value: 'todo_checkins', label: 'To-Do Check-Ins', icon: '✅' },

  // Professional
  { value: 'business', label: 'Business', icon: '📈' },
  { value: 'managing_finance', label: 'Managing Finance', icon: '💸' },

  // Social
  { value: 'discussing_interests', label: 'Discussing Interests', icon: '💬' },

  { value: 'other', label: 'Others', icon: '📌' },
];

// DUMMY DATA FOR DESIGN PREVIEW
const DUMMY_PROFILE = {
  streak_days: 12,
  total_goals_completed: 8,
};

const DUMMY_GOALS: Goal[] = [
  {
    id: 'goal1',
    user_id: 'test-user',
    title: 'Run 5km daily',
    description: 'Morning run to stay fit and energized',
    category: 'fitness',
    frequency: 'daily',
    frequency_count: 1,
    start_date: new Date().toISOString(),
    end_date: null,
    status: 'active',
    is_public: true,
    total_checkins: 0,
    current_streak: 0,
    longest_streak: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
  },
  {
    id: 'goal2',
    user_id: 'test-user',
    title: 'Read before bed',
    description: '30 mins of reading every night',
    category: 'reading',
    frequency: 'daily',
    frequency_count: 1,
    start_date: new Date().toISOString(),
    end_date: null,
    status: 'active',
    is_public: true,
    total_checkins: 0,
    current_streak: 0,
    longest_streak: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
  },
  {
    id: 'goal3',
    user_id: 'test-user',
    title: 'Meditate 10 mins',
    description: 'Morning meditation practice',
    category: 'mindfulness',
    frequency: 'daily',
    frequency_count: 1,
    start_date: new Date().toISOString(),
    end_date: null,
    status: 'active',
    is_public: true,
    total_checkins: 0,
    current_streak: 0,
    longest_streak: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
  },
  {
    id: 'goal4',
    user_id: 'test-user',
    title: 'Learn DSA - 2 problems',
    description: 'Solve 2 LeetCode problems daily',
    category: 'learning',
    frequency: 'daily',
    frequency_count: 1,
    start_date: new Date().toISOString(),
    end_date: null,
    status: 'active',
    is_public: true,
    total_checkins: 0,
    current_streak: 0,
    longest_streak: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
  },
];

export function Sidebar({ onClose }: SidebarProps) {
  // Using real data from Supabase
  const { user, profile } = useAuth();
  const { goals, createGoal, updateGoal, deleteGoal, loading: goalsLoading } = useGoals();
  const { createCheckin } = useCheckins();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState<number>(25);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('bangalore');
  const [showRequestCity, setShowRequestCity] = useState(false);
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [checkinGoal, setCheckinGoal] = useState<Goal | null>(null);

  const activeGoals = goals.filter((g) => g.status === 'active');

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleCreateGoal = () => {
    setEditingGoal(null);
    setShowGoalDialog(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setShowGoalDialog(true);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      const { error } = await deleteGoal(goalId);
      if (error) {
        alert(`Error deleting goal: ${error}`);
      }
    }
  };

  const handleGoalSubmit = async (goalData: any) => {
    let result;
    if (editingGoal) {
      result = await updateGoal(editingGoal.id, goalData);
    } else {
      result = await createGoal(goalData);
    }

    if (result.error) {
      return { data: null, error: result.error };
    }

    setShowGoalDialog(false);
    return { data: result.data, error: null };
  };

  const handleCheckinSubmit = async (data: { note?: string; mood?: any }) => {
    if (!checkinGoal) return { error: 'No goal selected' };

    const result = await createCheckin(checkinGoal.id, data);
    if (!result.error) {
      setCheckinGoal(null);
    }
    return result;
  };

  return (
    <aside className="w-72 shrink-0 bg-background lg:bg-transparent h-screen lg:h-auto overflow-y-auto lg:overflow-visible">
      <div className="sticky top-24 space-y-6 p-4 lg:p-0">
        {/* Mobile Close Button */}
        {onClose && (
          <div className="lg:hidden flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-accent"
              aria-label="Close menu"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* My Goals Card - FIRST */}
        <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">My Goals</h2>
            <Button
              size="sm"
              onClick={handleCreateGoal}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-xs"
            >
              + New
            </Button>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {activeGoals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active goals yet. Create one to get started!
              </p>
            ) : (
              activeGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-3 rounded-lg bg-background/50 border border-border/40 hover:border-orange-500/30 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{goal.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {goal.frequency} • {goal.category}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          🔥 {goal.current_streak} day streak
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setCheckinGoal(goal)}
                        className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded text-xs"
                        title="Check In"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleEditGoal(goal)}
                        className="p-1 hover:bg-accent rounded text-xs"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-1 hover:bg-accent rounded text-xs"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Filters Card - SECOND */}
        <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>

          {/* Categories */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Categories
              </h3>
              {selectedCategories.length > 0 && (
                <button
                  onClick={() => setSelectedCategories([])}
                  className="text-xs text-orange-400 hover:text-orange-500 font-medium transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((category) => {
                // Determine if this category label is long (more than 14 characters means full width)
                const isLong = category.label.length > 14;

                return (
                  <button
                    key={category.value}
                    onClick={() => toggleCategory(category.value)}
                    className={`
                      flex items-center justify-start gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium
                      transition-all duration-200 hover:scale-[1.02] border
                      ${isLong ? 'w-full' : 'flex-1 min-w-[calc(50%-0.25rem)]'}
                      ${selectedCategories.includes(category.value)
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400 shadow-md'
                        : 'bg-background border-border/60 hover:border-orange-300 hover:bg-accent/50'
                      }
                    `}
                  >
                    <span className="text-base shrink-0">{category.icon}</span>
                    <span className="text-left leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location Filter - Optional */}
          <div className="space-y-3 border-t border-border/40 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Location Filter
              </h3>
              <button
                onClick={() => setShowLocationFilter(!showLocationFilter)}
                className="text-xs text-orange-400 hover:text-orange-500 font-medium transition-colors"
              >
                {showLocationFilter ? 'Hide' : '+ Add'}
              </button>
            </div>

            {showLocationFilter && (
              <>
                {/* Info banner */}
                <div className="p-3 rounded-lg bg-accent/50 border border-border/40">
                  <div className="flex items-start gap-2">
                    <span className="text-sm">💡</span>
                    <p className="text-xs text-muted-foreground">
                      Filter by distance to find people nearby for in-person meetups
                    </p>
                  </div>
                </div>

                {/* Distance Filter */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Max Distance
                    </span>
                    <span className="text-sm font-semibold text-orange-400">
                      {maxDistance} km
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                    className="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 km</span>
                    <span>50 km</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Goal Dialog */}
      <GoalDialog
        open={showGoalDialog}
        onOpenChange={setShowGoalDialog}
        onSubmit={handleGoalSubmit}
        goal={editingGoal}
        mode={editingGoal ? 'edit' : 'create'}
      />

      {checkinGoal && (
        <CheckinDialog
          open={!!checkinGoal}
          onClose={() => setCheckinGoal(null)}
          goal={checkinGoal}
          onSubmit={handleCheckinSubmit}
        />
      )}
    </aside>
  );
}
