'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// import { useAuth } from '@/contexts/AuthContext';
// import { useGoals } from '@/hooks/useGoals';
import { GoalDialog } from '@/components/goal-dialog';
import type { Goal } from '@/types/database.types';

interface SidebarProps {
  mode: 'accountability' | 'irl';
  onClose?: () => void;
}

type GoalCategory = 'fitness' | 'nutrition' | 'learning' | 'reading' | 'creative' | 'career' | 'finance' | 'mindfulness' | 'social' | 'other';

const categories: { value: GoalCategory; label: string; icon: string }[] = [
  { value: 'fitness', label: 'Fitness', icon: '💪' },
  { value: 'nutrition', label: 'Nutrition', icon: '🥗' },
  { value: 'learning', label: 'Learning', icon: '📚' },
  { value: 'reading', label: 'Reading', icon: '📖' },
  { value: 'creative', label: 'Creative', icon: '🎨' },
  { value: 'career', label: 'Career', icon: '💼' },
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
  { value: 'social', label: 'Social', icon: '👥' },
  { value: 'other', label: 'Other', icon: '📌' },
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
    target_value: null,
    current_progress: null,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'goal2',
    user_id: 'test-user',
    title: 'Read before bed',
    description: '30 mins of reading every night',
    category: 'reading',
    frequency: 'daily',
    target_value: null,
    current_progress: null,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'goal3',
    user_id: 'test-user',
    title: 'Meditate 10 mins',
    description: 'Morning meditation practice',
    category: 'mindfulness',
    frequency: 'daily',
    target_value: null,
    current_progress: null,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'goal4',
    user_id: 'test-user',
    title: 'Learn DSA - 2 problems',
    description: 'Solve 2 LeetCode problems daily',
    category: 'learning',
    frequency: 'daily',
    target_value: null,
    current_progress: null,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function Sidebar({ mode, onClose }: SidebarProps) {
  // TEMPORARILY USING DUMMY DATA
  const profile = DUMMY_PROFILE;
  const goals = DUMMY_GOALS;

  // const { profile } = useAuth();
  // const { goals, createGoal, updateGoal, deleteGoal } = useGoals();
  const [selectedCategories, setSelectedCategories] = useState<GoalCategory[]>([]);
  const [maxDistance, setMaxDistance] = useState<number>(25);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const activeGoals = goals.filter((g) => g.status === 'active');

  const toggleCategory = (category: GoalCategory) => {
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
      // DUMMY: Simulate delete
      alert('Goal deleted successfully!');
    }
  };

  const handleGoalSubmit = async (goalData: any) => {
    // DUMMY: Simulate create/update
    await new Promise(resolve => setTimeout(resolve, 500));
    alert(editingGoal ? 'Goal updated!' : 'Goal created!');
    setShowGoalDialog(false);
    return { error: null };
  };

  return (
    <aside className="w-72 shrink-0 bg-background lg:bg-transparent h-screen lg:h-auto overflow-y-auto lg:overflow-visible">
      <div className="sticky top-24 space-y-6 p-4 lg:p-0">
        {/* Mobile Close Button */}
        {onClose && (
          <div className="lg:hidden flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-accent"
              aria-label="Close filters"
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
        {/* Filters Card */}
        <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>

          {/* Categories */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category.value}
                  variant={
                    selectedCategories.includes(category.value)
                      ? 'default'
                      : 'outline'
                  }
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => toggleCategory(category.value)}
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Distance Filter (only for IRL mode) */}
          {mode === 'irl' && (
            <div className="space-y-3 border-t border-border/40 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Max Distance
                </h3>
                <span className="text-sm font-semibold text-orange-400">
                  {maxDistance} miles
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
                <span>1 mi</span>
                <span>50 mi</span>
              </div>
            </div>
          )}
        </div>

        {/* My Goals Card */}
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
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

        {/* Quick Stats Card */}
        <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Your Progress</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Current Streak
              </span>
              <div className="flex items-center gap-1">
                <span className="text-2xl">🔥</span>
                <span className="text-xl font-bold text-orange-400">
                  {profile?.streak_days || 0}
                </span>
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Goals Completed
              </span>
              <span className="text-xl font-bold text-green-400">
                {profile?.total_goals_completed || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Active Goals
              </span>
              <span className="text-xl font-bold text-blue-400">
                {activeGoals.length}
              </span>
            </div>
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
    </aside>
  );
}
