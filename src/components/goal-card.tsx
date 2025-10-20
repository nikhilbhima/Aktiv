'use client';

import { Badge } from '@/components/ui/badge';
import { type Goal, categoryIcons, categoryColors } from '@/lib/mock-data';
import { motion } from 'framer-motion';

interface GoalCardProps {
  goal: Goal;
  compact?: boolean;
}

export function GoalCard({ goal, compact = false }: GoalCardProps) {
  const progressPercentage = (goal.checkIns / goal.totalCheckIns) * 100;

  if (compact) {
    return (
      <div className="rounded-lg border border-border/40 bg-card/30 p-4 hover:border-orange-500/30 transition-all">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{categoryIcons[goal.category]}</span>
            <h4 className="font-medium text-sm">{goal.title}</h4>
          </div>
          {goal.isIRL && (
            <Badge variant="outline" className="text-xs border-orange-500/30">
              📍 IRL
            </Badge>
          )}
        </div>
        <div className="w-full bg-accent rounded-full h-1.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="bg-gradient-to-r from-orange-500 to-amber-500 h-1.5 rounded-full"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {goal.checkIns}/{goal.totalCheckIns} check-ins • {goal.progress}%
          complete
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 hover:border-orange-500/30 transition-all hover:shadow-lg hover:shadow-orange-500/10 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{categoryIcons[goal.category]}</span>
          <div>
            <h3 className="font-semibold text-lg mb-1">{goal.title}</h3>
            <p className="text-sm text-muted-foreground">{goal.description}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className={`text-sm font-bold ${categoryColors[goal.category]}`}>
            {goal.progress}%
          </span>
        </div>
        <div className="w-full bg-accent rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-400">{goal.checkIns}</p>
          <p className="text-xs text-muted-foreground">Check-ins</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-400">
            {goal.totalCheckIns - goal.checkIns}
          </p>
          <p className="text-xs text-muted-foreground">Remaining</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">
            {Math.max(
              0,
              Math.ceil(
                (new Date(goal.targetDate).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              )
            )}
          </p>
          <p className="text-xs text-muted-foreground">Days left</p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="capitalize">
          {goal.category}
        </Badge>
        {goal.isIRL && goal.location && (
          <Badge
            variant="outline"
            className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-orange-500/30"
          >
            <span className="mr-1">📍</span>
            {goal.location}
          </Badge>
        )}
        <Badge variant="outline" className="text-xs">
          Target: {new Date(goal.targetDate).toLocaleDateString()}
        </Badge>
      </div>
    </div>
  );
}
