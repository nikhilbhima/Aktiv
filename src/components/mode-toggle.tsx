'use client';

import { motion } from 'framer-motion';

interface ModeToggleProps {
  mode: 'accountability' | 'irl';
  onModeChange: (mode: 'accountability' | 'irl') => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="relative inline-flex items-center gap-0 rounded-full bg-accent/50 p-1 w-full md:w-auto border border-border/60">
      {/* Accountability Button */}
      <button
        onClick={() => onModeChange('accountability')}
        className={`relative z-10 px-3 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${
          mode === 'accountability'
            ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <span className="hidden sm:inline">Accountability</span>
        <span className="sm:hidden">Account</span>
      </button>

      {/* IRL Button */}
      <button
        onClick={() => onModeChange('irl')}
        className={`relative z-10 px-3 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${
          mode === 'irl'
            ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        IRL
      </button>
    </div>
  );
}
