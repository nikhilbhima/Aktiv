# Phase 3 Complete: Supabase Backend Setup ✅

## Overview

Phase 3 is complete! The entire Supabase backend infrastructure is now ready for deployment. This document summarizes what has been built and how to proceed.

---

## What's Been Built

### 1. Database Schema (SQL Migrations)

**Location**: `supabase/migrations/`

#### File: `20250121000000_init_schema.sql`
Complete database schema including:

**Tables Created:**
- `users` - User profiles with location, preferences, and stats
- `goals` - User goals with frequency, timeline, and status tracking
- `matches` - Accountability partnerships between users
- `messages` - Chat messages between matched users
- `checkins` - Goal progress tracking with optional proof uploads
- `irl_activities` - In-person meetup events
- `irl_activity_participants` - Participants in IRL events

**Features:**
- PostGIS integration for location-based matching
- Automated triggers for timestamp updates
- Smart matching algorithms (Jaccard similarity)
- Performance indexes on all foreign keys and common queries
- Full Row Level Security (RLS) policies

**SQL Functions:**
- `calculate_match_score(user1, user2)` - Computes similarity score
- `find_accountability_matches(user_id, limit)` - Finds online partners
- `find_irl_matches(user_id, distance, limit)` - Finds nearby users

#### File: `20250121000001_storage_setup.sql`
Storage buckets and policies:
- `avatars` (public) - User profile pictures
- `checkin-proofs` (private) - Check-in proof images/videos
- `activity-images` (public) - IRL activity photos

---

### 2. TypeScript Type Definitions

**Location**: `src/types/database.types.ts`

**Exports:**
- Full `Database` interface matching Supabase schema
- Table row types: `User`, `Goal`, `Match`, `Message`, `Checkin`, etc.
- Insert/Update types for each table
- Enum types: `GoalCategory`, `GoalStatus`, `MatchStatus`, etc.
- Extended types for joins: `UserWithGoals`, `MatchWithUsers`, etc.

---

### 3. Supabase Client Setup

**Client-side** (`src/lib/supabase/client.ts`):
- Browser client for use in Client Components
- Uses `@supabase/ssr` for proper cookie handling

**Server-side** (`src/lib/supabase/server.ts`):
- Server client for Server Components and Route Handlers
- Handles cookie management automatically

**Middleware** (`src/lib/supabase/middleware.ts` + `middleware.ts`):
- Auth token refresh on every request
- Protected route handling
- Automatic redirect to login for unauthenticated users

---

### 4. Database Query Helpers

**Location**: `src/lib/supabase/queries.ts`

Ready-to-use functions for:

**Users:**
- `getUserById(supabase, userId)`
- `getUserByUsername(supabase, username)`
- `updateUserProfile(supabase, userId, updates)`

**Goals:**
- `getUserGoals(supabase, userId, status?)`
- `getGoalWithCheckins(supabase, goalId)`
- `createGoal(supabase, goal)`
- `updateGoal(supabase, goalId, updates)`

**Check-ins:**
- `createCheckin(supabase, checkin)`
- `getGoalCheckins(supabase, goalId, limit)`

**Matches:**
- `getUserMatches(supabase, userId, status?)`
- `createMatch(supabase, user1Id, user2Id, matchScore?, isIrlMatch?)`
- `updateMatchStatus(supabase, matchId, status)`

**Messages:**
- `getMatchMessages(supabase, matchId, limit)`
- `sendMessage(supabase, matchId, senderId, content)`
- `markMessageAsRead(supabase, messageId)`

**Matching Algorithms:**
- `findAccountabilityMatches(supabase, userId, limit)`
- `findIRLMatches(supabase, userId, maxDistanceKm, limit)`

**IRL Activities:**
- `getIRLActivities(supabase, filters?)`
- `createIRLActivity(supabase, activity)`
- `joinIRLActivity(supabase, activityId, userId)`
- `leaveIRLActivity(supabase, activityId, userId)`

---

### 5. Environment Configuration

**Files:**
- `.env.local.example` - Template for environment variables
- `.gitignore` - Already ignores `.env.local` for security

**Required Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## How to Deploy

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Save database password

### Step 2: Enable PostGIS

1. Go to Database → Extensions
2. Enable `postgis`

### Step 3: Run Migrations

1. Go to SQL Editor
2. Run `supabase/migrations/20250121000000_init_schema.sql`
3. Run `supabase/migrations/20250121000001_storage_setup.sql`

### Step 4: Verify Setup

1. Check Table Editor for 7 tables
2. Check Storage for 3 buckets
3. Check Database → Functions for 3 functions

### Step 5: Configure Environment

1. Get Project URL and anon key from Project Settings → API
2. Create `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
3. Fill in your Supabase credentials

### Step 6: Test Connection

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) - No Supabase errors should appear.

---

## Database Schema Overview

### Users Table
Stores complete user profiles including:
- Basic info (email, name, username, bio, avatar)
- Demographics (gender, date of birth)
- Location (city, state, country, PostGIS point)
- Preferences (accountability vs IRL mode, distance, categories)
- Social links (Instagram, Twitter, LinkedIn, website)
- Stats (streak, total goals completed, check-ins)

### Goals Table
User-created goals with:
- Title, description, category
- Frequency (daily, weekly, monthly, custom)
- Timeline (start date, end date)
- Status (active, completed, paused, abandoned)
- Privacy (public/private)
- Stats (check-ins, streaks)

### Matches Table
Connections between users:
- Bidirectional relationship (user1_id < user2_id)
- Match score (0.00 - 1.00 Jaccard similarity)
- Status (pending, accepted, rejected, blocked)
- IRL vs accountability mode flag

### Messages Table
Chat system:
- Linked to match_id
- Read/unread tracking
- Timestamp for ordering

### Checkins Table
Progress tracking:
- Linked to goal_id
- Optional notes and proof uploads
- Mood tracking (great, good, okay, struggling)

### IRL Activities Table
In-person meetups:
- Title, description, category
- Location (name, address, PostGIS point)
- Scheduling (datetime, duration)
- Capacity (max participants, current count)

### IRL Activity Participants Table
Many-to-many join table:
- Links users to activities
- Status tracking (confirmed, cancelled, completed)

---

## Security Features

### Row Level Security (RLS)

All tables protected with policies:

**Users**: Public read, own profile update
**Goals**: Public or own private goals
**Matches**: Only visible to participants
**Messages**: Only in user's matches
**Checkins**: Public goals or own check-ins
**IRL Activities**: Open activities viewable by all
**IRL Participants**: Visible to creator and participants

### Storage Policies

**Avatars**:
- Public read
- Own folder upload only
- 5MB limit, images only

**Checkin Proofs**:
- Private, owner only
- 10MB limit, images/videos

**Activity Images**:
- Public read
- Authenticated upload
- 5MB limit, images only

---

## Matching Algorithms

### Accountability Mode

**Algorithm**: Jaccard Similarity
- Compares goal categories between users
- Score = (shared categories) / (total unique categories)
- Example: User A [fitness, learning], User B [fitness, creative]
  - Shared: 1 (fitness)
  - Total: 3 (fitness, learning, creative)
  - Score: 0.33

**Function**: `find_accountability_matches(user_id, limit)`
- Excludes self
- Excludes existing matches
- Only accountability mode users
- Only users with active goals
- Sorted by match score (highest first)

### IRL Mode

**Algorithm**: Distance + Similarity
- Uses PostGIS ST_DWithin for efficient geo queries
- Filters by max distance (default 50km)
- Applies same Jaccard similarity for match score
- Sorted by distance first, then match score

**Function**: `find_irl_matches(user_id, max_distance_meters, limit)`
- Requires location set for both users
- Only IRL mode users
- Returns distance in kilometers

---

## Performance Optimizations

### Indexes Created

**Users**:
- username, email (unique queries)
- location_point (GIST - spatial queries)
- created_at (temporal queries)

**Goals**:
- user_id (foreign key lookups)
- category, status (filtering)
- (user_id, status) composite (active goals query)

**Matches**:
- user1_id, user2_id (match lookups)
- status (filtering)
- (user1_id, user2_id) composite (unique constraint)

**Messages**:
- match_id, sender_id (message queries)
- (match_id, sent_at) composite (chronological messages)

**Checkins**:
- goal_id, user_id (checkin queries)
- (goal_id, completed_at) composite (goal timeline)

**IRL Activities**:
- creator_id, category, status (filtering)
- location_point (GIST - spatial queries)
- scheduled_at (time-based queries)

---

## Next Steps (Phase 4)

Now that the backend is ready, the next phase is:

1. **Authentication Flow**
   - Sign up / Sign in pages
   - Email verification
   - Password reset
   - OAuth providers (Google, GitHub)

2. **Connect Dashboard to Database**
   - Replace mock data with real Supabase queries
   - Implement real-time subscriptions
   - Add loading states and error handling

3. **User Onboarding**
   - Profile setup wizard
   - Goal creation flow
   - Preference selection

4. **Real-time Features**
   - Live chat updates
   - Check-in notifications
   - Match requests

---

## Documentation

Full setup guide: `supabase/SETUP_GUIDE.md`

Contains:
- Detailed step-by-step instructions
- Database schema explanations
- SQL query examples
- Troubleshooting tips
- Security best practices

---

## Technical Stack

- **Database**: PostgreSQL (via Supabase)
- **Extensions**: PostGIS (location features)
- **Auth**: Supabase Auth (built-in)
- **Storage**: Supabase Storage (built-in)
- **ORM**: Supabase JavaScript Client
- **Type Safety**: Full TypeScript types
- **SSR**: Next.js 15 with App Router

---

## File Structure

```
aktiv-app/
├── supabase/
│   ├── migrations/
│   │   ├── 20250121000000_init_schema.sql      # Database schema
│   │   └── 20250121000001_storage_setup.sql    # Storage buckets
│   └── SETUP_GUIDE.md                          # Detailed setup guide
├── src/
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts                       # Browser client
│   │       ├── server.ts                       # Server client
│   │       ├── middleware.ts                   # Auth middleware
│   │       └── queries.ts                      # Query helpers
│   └── types/
│       └── database.types.ts                   # TypeScript types
├── middleware.ts                               # Next.js middleware
├── .env.local.example                          # Environment template
└── PHASE3_COMPLETE.md                          # This file
```

---

## Summary

✅ **7 database tables** with full schema
✅ **Row Level Security** on all tables
✅ **3 storage buckets** with policies
✅ **3 SQL functions** for matching algorithms
✅ **Full TypeScript types** for type safety
✅ **Client & server** Supabase clients
✅ **Auth middleware** for protected routes
✅ **Query helper functions** for all operations
✅ **Comprehensive documentation** and setup guide

**Status**: Phase 3 Complete - Ready for Deployment
**Next**: Phase 4 - Authentication & User Flow

---

**Generated with [Claude Code](https://claude.com/claude-code)**
