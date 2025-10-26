# 🎯 Fixed! Two-Step Database Setup

## ⚠️ The Problem:
The single SQL file had an issue. I've split it into 2 simple steps.

---

## ✅ STEP 1: Enable Extensions (30 seconds)

1. **Go to Supabase SQL Editor:**
   - https://supabase.com/dashboard/project/ntjwstcmdpblylkwbgjy/sql
   - Click "New query"

2. **Copy this file's content:**
   - File: `STEP1_ENABLE_POSTGIS.sql`
   - It's only 8 lines!

3. **Paste and click "Run"**
   - Should see "Success" ✅

---

## ✅ STEP 2: Create Database Tables (30 seconds)

1. **Click "New query" again** (create a fresh query)

2. **Copy this file's content:**
   - File: `STEP2_DATABASE_TABLES.sql`
   - It's 828 lines (all your tables, triggers, etc.)

3. **Paste and click "Run"**
   - Should see "Success" ✅
   - This creates all 8 tables, security rules, triggers, and storage

---

## 🔍 Verify It Worked:

After Step 2 completes:

1. **Go to Table Editor:**
   - Dashboard → Table Editor (left sidebar)

2. **You should see these tables:**
   - ✅ users
   - ✅ goals
   - ✅ matches
   - ✅ messages
   - ✅ checkins
   - ✅ irl_activities
   - ✅ irl_activity_participants
   - ✅ notifications

---

## 🚀 After Both Steps Complete:

**Reply "Done!"** and I'll:
1. Start your development server
2. Open the app in your browser
3. Guide you to test it

---

**Ready? Run STEP1 first, then STEP2!**
