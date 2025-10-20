'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { categoryIcons, type GoalCategory } from '@/lib/mock-data';

interface SidebarProps {
  mode: 'accountability' | 'irl';
  onClose?: () => void;
}

const categories: { value: GoalCategory; label: string }[] = [
  { value: 'fitness', label: 'Fitness' },
  { value: 'learning', label: 'Learning' },
  { value: 'creative', label: 'Creative' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'social', label: 'Social' },
];

export function Sidebar({ mode, onClose }: SidebarProps) {
  const [selectedCategories, setSelectedCategories] = useState<GoalCategory[]>([]);
  const [maxDistance, setMaxDistance] = useState<number>(25);

  const toggleCategory = (category: GoalCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
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
                  <span className="mr-1">
                    {categoryIcons[category.value]}
                  </span>
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
                <span className="text-xl font-bold text-orange-400">12</span>
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Goals Completed
              </span>
              <span className="text-xl font-bold text-green-400">24</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Active Goals
              </span>
              <span className="text-xl font-bold text-blue-400">2</span>
            </div>
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="rounded-xl border border-border/40 bg-gradient-to-br from-orange-500/10 to-amber-500/10 p-6">
          <p className="text-sm italic text-muted-foreground">
            &ldquo;The secret of getting ahead is getting started.&rdquo;
          </p>
          <p className="text-xs text-muted-foreground mt-2">— Mark Twain</p>
        </div>
      </div>
    </aside>
  );
}
