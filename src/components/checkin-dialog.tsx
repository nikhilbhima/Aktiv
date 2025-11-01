'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Goal, CheckinMood } from '@/types/database.types';

interface CheckinDialogProps {
  open: boolean;
  onClose: () => void;
  goal: Goal;
  onSubmit: (data: { note?: string; mood?: CheckinMood }) => Promise<{ error: string | null }>;
}

const MOOD_OPTIONS: { value: CheckinMood; emoji: string; label: string; color: string }[] = [
  { value: 'great', emoji: '🤩', label: 'Great', color: 'bg-green-500' },
  { value: 'good', emoji: '😊', label: 'Good', color: 'bg-blue-500' },
  { value: 'okay', emoji: '😐', label: 'Okay', color: 'bg-yellow-500' },
  { value: 'struggling', emoji: '😓', label: 'Struggling', color: 'bg-red-500' },
];

export function CheckinDialog({ open, onClose, goal, onSubmit }: CheckinDialogProps) {
  const [note, setNote] = useState('');
  const [mood, setMood] = useState<CheckinMood>('good');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await onSubmit({ note: note.trim() || undefined, mood });

    if (result.error) {
      alert(`Error: ${result.error}`);
    } else {
      setNote('');
      setMood('good');
      onClose();
    }

    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Check in: {goal.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mood Selection */}
          <div>
            <label className="text-sm font-semibold mb-3 block">
              How did it go?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {MOOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMood(option.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    mood === option.value
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
                      : 'border-border hover:border-orange-300 dark:hover:border-orange-700'
                  }`}
                >
                  <span className="text-3xl">{option.emoji}</span>
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note (Optional) */}
          <div>
            <label htmlFor="note" className="text-sm font-semibold mb-2 block">
              Add a note (optional)
            </label>
            <Textarea
              id="note"
              placeholder="How did it go? Any challenges or wins?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Share your experience, progress, or any thoughts
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Checking in...
                </span>
              ) : (
                '✓ Check In'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
