'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Goal } from '@/types/database.types';

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (goalData: any) => Promise<{ data: any; error: string | null }>;
  goal?: Goal | null;
  mode: 'create' | 'edit';
}

const CATEGORIES = [
  'fitness',
  'nutrition',
  'learning',
  'reading',
  'creative',
  'career',
  'finance',
  'mindfulness',
  'social',
  'other',
];

const FREQUENCIES = ['daily', 'weekly', 'monthly', 'custom'];

export function GoalDialog({
  open,
  onOpenChange,
  onSubmit,
  goal,
  mode,
}: GoalDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('fitness');
  const [frequency, setFrequency] = useState('daily');
  const [frequencyCount, setFrequencyCount] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load goal data when editing
  useEffect(() => {
    if (mode === 'edit' && goal) {
      setTitle(goal.title);
      setDescription(goal.description || '');
      setCategory(goal.category);
      setFrequency(goal.frequency);
      setFrequencyCount(goal.frequency_count);
      setStartDate(goal.start_date || '');
      setEndDate(goal.end_date || '');
      setIsPublic(goal.is_public);
    } else {
      // Reset for create mode
      setTitle('');
      setDescription('');
      setCategory('fitness');
      setFrequency('daily');
      setFrequencyCount(1);
      setStartDate('');
      setEndDate('');
      setIsPublic(true);
    }
    setError(null);
  }, [mode, goal, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate date range
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setError('End date must be on or after start date');
      setLoading(false);
      return;
    }

    const goalData = {
      title,
      description: description || null,
      category,
      frequency,
      frequency_count: frequencyCount,
      start_date: startDate || null,
      end_date: endDate || null,
      is_public: isPublic,
      status: 'active' as const,
    };

    const result = await onSubmit(goalData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Goal' : 'Edit Goal'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Set a new goal to track your progress and find accountability partners.'
              : 'Update your goal details.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Goal Title *
            </label>
            <Input
              id="title"
              placeholder="e.g., Run 5km every morning"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Add details about your goal..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category *
              </label>
              <Select value={category} onValueChange={setCategory} disabled={loading}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="frequency" className="text-sm font-medium">
                Frequency *
              </label>
              <Select value={frequency} onValueChange={setFrequency} disabled={loading}>
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((freq) => (
                    <SelectItem key={freq} value={freq}>
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="frequencyCount" className="text-sm font-medium">
              Times per {frequency === 'custom' ? 'period' : frequency.replace('ly', '')} *
            </label>
            <Input
              id="frequencyCount"
              type="number"
              min="1"
              value={frequencyCount}
              onChange={(e) => setFrequencyCount(parseInt(e.target.value))}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startDate" className="text-sm font-medium">
                Start Date
              </label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="endDate" className="text-sm font-medium">
                End Date
              </label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={loading}
              className="w-4 h-4 rounded border-border"
            />
            <label htmlFor="isPublic" className="text-sm">
              Make this goal public (visible to potential matches)
            </label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              disabled={loading}
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create Goal' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
