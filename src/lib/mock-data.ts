export type GoalCategory = 'fitness' | 'learning' | 'creative' | 'productivity' | 'wellness' | 'social';

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location: string;
  socials?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  streakDays: number;
  goalsCompleted: number;
  currentGoals: Goal[];
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  progress: number; // 0-100
  targetDate: string;
  checkIns: number;
  totalCheckIns: number;
  isIRL?: boolean;
  location?: string;
}

export interface Match {
  id: string;
  user: User;
  matchedGoals: Goal[];
  matchScore: number;
  distance?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface ChatThread {
  id: string;
  participant: User;
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
}

// Mock current user
export const currentUser: User = {
  id: 'user-1',
  name: 'Alex Chen',
  username: '@alexchen',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  bio: 'Building in public | Running enthusiast | Learning Spanish',
  location: 'San Francisco, CA',
  socials: {
    instagram: 'alexchen',
    twitter: 'alexchen',
  },
  streakDays: 12,
  goalsCompleted: 24,
  currentGoals: [
    {
      id: 'goal-1',
      title: 'Run a 5K',
      description: 'Training for my first 5K race in 8 weeks',
      category: 'fitness',
      progress: 65,
      targetDate: '2025-12-15',
      checkIns: 13,
      totalCheckIns: 20,
      isIRL: true,
      location: 'Golden Gate Park',
    },
    {
      id: 'goal-2',
      title: 'Learn Spanish',
      description: 'Practice 30 min daily on Duolingo',
      category: 'learning',
      progress: 40,
      targetDate: '2025-12-31',
      checkIns: 24,
      totalCheckIns: 60,
    },
  ],
};

// Mock potential matches
export const mockMatches: Match[] = [
  {
    id: 'match-1',
    user: {
      id: 'user-2',
      name: 'Sarah Johnson',
      username: '@sarahj',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      bio: 'Marathon runner | Tech lead | Coffee addict',
      location: 'San Francisco, CA',
      streakDays: 45,
      goalsCompleted: 67,
      currentGoals: [],
    },
    matchedGoals: [
      {
        id: 'goal-m1',
        title: 'Half Marathon Training',
        description: 'Training for Bay to Breakers',
        category: 'fitness',
        progress: 70,
        targetDate: '2025-11-30',
        checkIns: 28,
        totalCheckIns: 40,
        isIRL: true,
        location: 'Marina District',
      },
    ],
    matchScore: 95,
    distance: '2.3 miles away',
  },
  {
    id: 'match-2',
    user: {
      id: 'user-3',
      name: 'Marcus Williams',
      username: '@marcusw',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
      bio: 'Polyglot | Teaching Spanish & learning Mandarin',
      location: 'Oakland, CA',
      streakDays: 89,
      goalsCompleted: 134,
      currentGoals: [],
    },
    matchedGoals: [
      {
        id: 'goal-m2',
        title: 'Spanish Conversation Practice',
        description: 'Weekly meetups for Spanish learners',
        category: 'learning',
        progress: 55,
        targetDate: '2025-12-20',
        checkIns: 11,
        totalCheckIns: 20,
        isIRL: true,
        location: 'Downtown Oakland',
      },
    ],
    matchScore: 88,
    distance: '8.1 miles away',
  },
  {
    id: 'match-3',
    user: {
      id: 'user-4',
      name: 'Emily Rodriguez',
      username: '@emilyrod',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      bio: 'Digital nomad | Fitness & wellness coach',
      location: 'Berkeley, CA',
      streakDays: 23,
      goalsCompleted: 45,
      currentGoals: [],
    },
    matchedGoals: [
      {
        id: 'goal-m3',
        title: 'Morning Running Club',
        description: 'Join us for 6am runs around the campus',
        category: 'fitness',
        progress: 80,
        targetDate: '2025-11-25',
        checkIns: 32,
        totalCheckIns: 40,
        isIRL: true,
        location: 'UC Berkeley Campus',
      },
    ],
    matchScore: 82,
    distance: '12.5 miles away',
  },
];

// Mock chat threads
export const mockChatThreads: ChatThread[] = [
  {
    id: 'chat-1',
    participant: mockMatches[0].user,
    lastMessage: {
      id: 'msg-1',
      senderId: 'user-2',
      text: 'Want to join me for a run tomorrow morning?',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      read: false,
    },
    unreadCount: 2,
    messages: [
      {
        id: 'msg-0',
        senderId: 'user-1',
        text: 'Hey! I saw you\'re also training for a run. How\'s it going?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: true,
      },
      {
        id: 'msg-1',
        senderId: 'user-2',
        text: 'Going great! I\'m on week 6 of my training plan.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: true,
      },
      {
        id: 'msg-2',
        senderId: 'user-2',
        text: 'Want to join me for a run tomorrow morning?',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        read: false,
      },
    ],
  },
  {
    id: 'chat-2',
    participant: mockMatches[1].user,
    lastMessage: {
      id: 'msg-3',
      senderId: 'user-1',
      text: 'Thanks for the tips! I\'ll check out that podcast.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      read: true,
    },
    unreadCount: 0,
    messages: [
      {
        id: 'msg-3',
        senderId: 'user-3',
        text: 'I recommend the Coffee Break Spanish podcast!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        read: true,
      },
      {
        id: 'msg-4',
        senderId: 'user-1',
        text: 'Thanks for the tips! I\'ll check out that podcast.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        read: true,
      },
    ],
  },
];

export const categoryColors: Record<GoalCategory, string> = {
  fitness: 'text-orange-400',
  learning: 'text-blue-400',
  creative: 'text-purple-400',
  productivity: 'text-green-400',
  wellness: 'text-pink-400',
  social: 'text-yellow-400',
};

export const categoryIcons: Record<GoalCategory, string> = {
  fitness: '💪',
  learning: '📚',
  creative: '🎨',
  productivity: '⚡',
  wellness: '🧘',
  social: '👥',
};
