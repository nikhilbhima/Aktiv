'use client';

import { motion } from 'framer-motion';

interface ModeToggleProps {
  mode: 'accountability' | 'irl';
  onModeChange: (mode: 'accountability' | 'irl') => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="relative flex items-center gap-1 md:gap-2 rounded-full bg-accent/50 p-1 w-full md:w-auto">
      {/* Sliding background */}
      <motion.div
        className="absolute inset-y-1 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30"
        initial={false}
        animate={{
          left: mode === 'accountability' ? '4px' : '50%',
          right: mode === 'accountability' ? '50%' : '4px',
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      />

      {/* Accountability Button */}
      <button
        onClick={() => onModeChange('accountability')}
        className={`relative z-10 flex-1 md:flex-initial px-3 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${
          mode === 'accountability'
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <span className="flex items-center justify-center gap-1 md:gap-2">
          <span className="text-sm md:text-base">🤝</span>
          <span className="hidden sm:inline">Accountability</span>
          <span className="sm:hidden">Account</span>
        </span>
      </button>

      {/* IRL Button */}
      <button
        onClick={() => onModeChange('irl')}
        className={`relative z-10 flex-1 md:flex-initial px-3 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${
          mode === 'irl'
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <span className="flex items-center justify-center gap-1 md:gap-2">
          <span className="text-sm md:text-base">🌍</span>
          IRL
        </span>
      </button>
    </div>
  );
}
