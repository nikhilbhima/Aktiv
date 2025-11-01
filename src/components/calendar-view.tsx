'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface CalendarViewProps {
  // No mode needed - unified view
}

// DUMMY DATA FOR DESIGN PREVIEW
const DUMMY_CHECKINS = {
  '2025-10-20': [
    { goalId: 'goal1', goalTitle: 'Run 5km daily', completed: true, partner: 'Priya Sharma' },
    { goalId: 'goal2', goalTitle: 'Read before bed', completed: true, partner: 'Rahul Verma' },
  ],
  '2025-10-21': [
    { goalId: 'goal1', goalTitle: 'Run 5km daily', completed: true, partner: 'Priya Sharma' },
    { goalId: 'goal2', goalTitle: 'Read before bed', completed: false, partner: 'Rahul Verma' },
    { goalId: 'goal3', goalTitle: 'Meditate 10 mins', completed: true, partner: 'Ananya Patel' },
  ],
  '2025-10-22': [
    { goalId: 'goal1', goalTitle: 'Run 5km daily', completed: true, partner: 'Priya Sharma' },
    { goalId: 'goal3', goalTitle: 'Meditate 10 mins', completed: true, partner: 'Ananya Patel' },
  ],
  '2025-10-23': [
    { goalId: 'goal1', goalTitle: 'Run 5km daily', completed: true, partner: 'Priya Sharma' },
    { goalId: 'goal2', goalTitle: 'Read before bed', completed: true, partner: 'Rahul Verma' },
    { goalId: 'goal3', goalTitle: 'Meditate 10 mins', completed: true, partner: 'Ananya Patel' },
    { goalId: 'goal4', goalTitle: 'Learn DSA - 2 problems', completed: true, partner: 'Karthik Reddy' },
  ],
  '2025-10-24': [
    { goalId: 'goal1', goalTitle: 'Run 5km daily', completed: true, partner: 'Priya Sharma' },
    { goalId: 'goal2', goalTitle: 'Read before bed', completed: true, partner: 'Rahul Verma' },
  ],
  '2025-10-25': [
    { goalId: 'goal1', goalTitle: 'Run 5km daily', completed: true, partner: 'Priya Sharma' },
    { goalId: 'goal2', goalTitle: 'Read before bed', completed: true, partner: 'Rahul Verma' },
    { goalId: 'goal3', goalTitle: 'Meditate 10 mins', completed: true, partner: 'Ananya Patel' },
  ],
  '2025-10-26': [
    { goalId: 'goal1', goalTitle: 'Run 5km daily', completed: false, partner: 'Priya Sharma' },
    { goalId: 'goal2', goalTitle: 'Read before bed', completed: false, partner: 'Rahul Verma' },
    { goalId: 'goal3', goalTitle: 'Meditate 10 mins', completed: false, partner: 'Ananya Patel' },
    { goalId: 'goal4', goalTitle: 'Learn DSA - 2 problems', completed: false, partner: 'Karthik Reddy' },
  ],
};

export function CalendarView({}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const formatDate = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getCheckinsForDate = (dateStr: string) => {
    return DUMMY_CHECKINS[dateStr as keyof typeof DUMMY_CHECKINS] || [];
  };

  const getCompletionRate = (dateStr: string) => {
    const checkins = getCheckinsForDate(dateStr);
    if (checkins.length === 0) return 0;
    const completed = checkins.filter(c => c.completed).length;
    return Math.round((completed / checkins.length) * 100);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const selectedCheckins = selectedDate ? getCheckinsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-1">Goal Calendar</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Track your daily progress and accountability partners</p>
        </div>
        <button
          onClick={goToToday}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium text-sm shadow-md hover:shadow-lg transition-all shrink-0"
        >
          Today
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border/60 bg-white dark:bg-zinc-900 p-6 shadow-md">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={goToPreviousMonth}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-lg font-bold">
                {monthNames[month]} {year}
              </h3>
              <button
                onClick={goToNextMonth}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before the first day of the month */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = formatDate(day);
                const completionRate = getCompletionRate(dateStr);
                const hasCheckins = getCheckinsForDate(dateStr).length > 0;
                const today = isToday(day);
                const selected = selectedDate === dateStr;

                return (
                  <motion.button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 text-sm font-medium transition-all relative ${
                      selected
                        ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg'
                        : today
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-2 border-orange-500'
                        : hasCheckins
                        ? 'bg-accent/50 hover:bg-accent'
                        : 'hover:bg-accent/30'
                    }`}
                  >
                    <span className={selected ? 'text-white' : ''}>{day}</span>
                    {hasCheckins && !selected && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                        {completionRate === 100 ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        ) : completionRate > 0 ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border/40">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-muted-foreground">All Goals Done</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-xs text-muted-foreground">Partial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="text-xs text-muted-foreground">Incomplete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border/60 bg-white dark:bg-zinc-900 p-6 shadow-md">
            {selectedDate ? (
              <>
                <h3 className="text-lg font-bold mb-4">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
                {selectedCheckins.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCheckins.map((checkin, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-accent/50 border border-border/40"
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            checkin.completed
                              ? 'bg-green-500'
                              : 'bg-red-400'
                          }`}>
                            {checkin.completed ? (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{checkin.goalTitle}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Partner: {checkin.partner}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No check-ins recorded for this day
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-sm text-muted-foreground">
                  Select a date to view your check-ins
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
