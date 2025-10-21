# Aktiv - Supabase Setup Guide

## Phase 3: Database Setup Complete! 🎉

This guide will help you set up your Supabase project and deploy the database schema.

---

## 📋 What's Included

### Database Schema
- ✅ **7 Main Tables**: users, goals, matches, messages, checkins, irl_activities, irl_activity_participants
- ✅ **PostGIS Integration**: Location-based features for IRL mode
- ✅ **Performance Indexes**: Optimized queries for all tables
- ✅ **Automated Triggers**: Auto-update timestamps and user stats
- ✅ **Matching Algorithms**: Smart SQL functions for finding accountability partners

### Security
- ✅ **Row Level Security (RLS)**: All tables protected with proper policies
- ✅ **Secure Storage**: Avatar uploads, check-in proofs, activity images
- ✅ **Privacy Controls**: Public/private goal visibility

### TypeScript
- ✅ **Full Type Safety**: Database types generated
- ✅ **Query Helpers**: Reusable functions for common operations
- ✅ **SSR Support**: Client and server Supabase clients

---

## 🚀 Step-by-Step Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up or log in
4. Click "New Project"
5. Fill in details:
   - **Name**: `aktiv-app` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait ~2 minutes for provisioning

### Step 2: Enable PostGIS Extension

1. In your Supabase dashboard, go to **Database** → **Extensions**
2. Search for `postgis`
3. Click **Enable** next to "postgis"
4. This enables location-based features for IRL mode

### Step 3: Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/migrations/20250121000000_init_schema.sql`
4. Paste into the SQL editor
5. Click **Run** (bottom right)
6. Wait for success message (should take 5-10 seconds)

7. Click **New Query** again
8. Copy the entire contents of `supabase/migrations/20250121000001_storage_setup.sql`
9. Paste and click **Run**
10. Success! ✅

### Step 4: Verify Database Setup

1. Go to **Table Editor** in the sidebar
2. You should see all 7 tables:
   - users
   - goals
   - matches
   - messages
   - checkins
   - irl_activities
   - irl_activity_participants

3. Go to **Database** → **Functions**
4. Verify these functions exist:
   - `calculate_match_score`
   - `find_accountability_matches`
   - `find_irl_matches`

### Step 5: Set Up Storage Buckets

1. Go to **Storage** in the sidebar
2. Verify these buckets were created:
   - `avatars` (Public)
   - `checkin-proofs` (Private)
   - `activity-images` (Public)

3. If buckets don't exist, create them manually:
   - Click "New bucket"
   - Name: `avatars`, Public: ✅, Max file size: 5 MB
   - Name: `checkin-proofs`, Public: ❌, Max file size: 10 MB
   - Name: `activity-images`, Public: ✅, Max file size: 5 MB

### Step 6: Get API Keys

1. Go to **Project Settings** (gear icon) → **API**
2. Copy these values:

   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJhbG...`

3. In your project root, create `.env.local`:

```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` and paste your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 7: Test the Connection

1. Start your dev server:
```bash
npm run dev
```

2. The app should start without errors
3. Check the browser console - no Supabase connection errors should appear

---

## 🗄️ Database Schema Overview

### Users Table
Stores user profiles, preferences, location, and stats.

**Key Fields:**
- `accountability_mode`: true = online accountability, false = IRL meetups
- `location_point`: PostGIS geography for distance calculations
- `preferred_categories`: Array of goal categories user is interested in
- `streak_days`, `total_goals_completed`: Gamification stats

### Goals Table
User goals with frequency, timeline, and privacy settings.

**Key Fields:**
- `category`: fitness, learning, creative, etc.
- `frequency`: daily, weekly, monthly, custom
- `status`: active, completed, paused, abandoned
- `is_public`: Controls visibility to other users

### Matches Table
Connections between users for accountability partnerships.

**Key Fields:**
- `match_score`: 0.00 - 1.00 (calculated by Jaccard similarity)
- `status`: pending, accepted, rejected, blocked
- `is_irl_match`: Distinguishes IRL from online matches

### Messages Table
Chat messages between matched users.

**Key Fields:**
- `match_id`: Foreign key to matches table
- `is_read`, `read_at`: Message read status

### Checkins Table
Goal progress tracking with optional proof uploads.

**Key Fields:**
- `proof_url`: Link to uploaded image/video in Supabase Storage
- `mood`: great, good, okay, struggling

### IRL Activities Table
In-person meetups for IRL mode users.

**Key Fields:**
- `location_point`: PostGIS point for distance searches
- `scheduled_at`: DateTime for the activity
- `max_participants`: Capacity limit

### IRL Activity Participants Table
Many-to-many relationship between users and activities.

---

## 🔐 Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies for:
- **Users**: Can view all profiles, update own profile
- **Goals**: Public goals viewable by all, private only by owner
- **Matches**: Only visible to participants
- **Messages**: Only readable by match participants
- **Checkins**: Visible if goal is public or user is owner
- **IRL Activities**: Open activities viewable by all

### Storage Policies

- **Avatars**: Public read, authenticated upload (own folder only)
- **Checkin Proofs**: Private, only owner can access
- **Activity Images**: Public read, authenticated upload

---

## 🎯 Matching Algorithm

### Accountability Mode
**Function**: `find_accountability_matches(user_id, limit)`

Finds users with similar goals using:
1. **Jaccard Similarity**: Calculates overlap in goal categories
2. **Active Goals Only**: Only matches users with active goals
3. **Excludes Existing Matches**: Won't suggest already-matched users
4. **Returns**: Sorted by match score (highest first)

### IRL Mode
**Function**: `find_irl_matches(user_id, max_distance_meters, limit)`

Finds nearby users using:
1. **PostGIS Distance Calculation**: Uses ST_DWithin for efficient geo queries
2. **Distance + Match Score**: Sorts by distance, then similarity
3. **Location Required**: Both users must have location set
4. **Returns**: Distance in km + match score

---

## 📊 Useful SQL Queries

### Get User's Active Goals
```sql
SELECT * FROM goals
WHERE user_id = 'xxx'
  AND status = 'active'
ORDER BY created_at DESC;
```

### Get Match Suggestions for User
```sql
SELECT * FROM find_accountability_matches('user-id-here', 20);
```

### Get Recent Checkins for a Goal
```sql
SELECT * FROM checkins
WHERE goal_id = 'xxx'
ORDER BY completed_at DESC
LIMIT 30;
```

### Get Nearby IRL Activities
```sql
SELECT *,
  ST_Distance(
    location_point,
    ST_MakePoint(-122.4194, 37.7749)::geography
  ) / 1000 AS distance_km
FROM irl_activities
WHERE status = 'open'
  AND scheduled_at > NOW()
ORDER BY distance_km ASC;
```

---

## 🧪 Next Steps

### Testing
1. Create a test user in Supabase Auth
2. Insert test data via Table Editor
3. Test RLS policies by logging in
4. Verify matching algorithms return results

### Integration
1. Build authentication flow (login/signup)
2. Connect dashboard to real Supabase data
3. Replace mock data with live queries
4. Add real-time subscriptions for messages

### Production
1. Set up database backups (Auto in Supabase)
2. Monitor query performance in Dashboard
3. Add indexes if new query patterns emerge
4. Set up Supabase Edge Functions for complex logic

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)

---

## 🐛 Troubleshooting

### "relation does not exist" Error
- Make sure you ran both migration files
- Check that you're in the correct Supabase project

### "permission denied for table" Error
- RLS is working! You need to be authenticated
- Check your auth token is valid

### PostGIS Functions Not Found
- Enable the PostGIS extension in Supabase Dashboard
- Restart your database (Settings → Database → Restart)

### Storage Bucket Not Found
- Create buckets manually in Storage section
- Or run the storage setup SQL again

---

## ✅ Phase 3 Complete!

You now have:
- ✅ Production-ready database schema
- ✅ Secure RLS policies
- ✅ Smart matching algorithms
- ✅ Location-based features
- ✅ Storage for media uploads
- ✅ Full TypeScript type safety

**Next**: Phase 4 - Authentication & User Flow
