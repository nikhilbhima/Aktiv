# 🔑 CREATE TEST USER ACCOUNT

## Option 1: Create Account via Supabase Dashboard (EASIEST - 2 minutes)

### Steps:

1. **Go to Supabase Authentication:**
   - Open: https://supabase.com/dashboard/project/hticzqqxpsxccevtdhrb/auth/users
   - Click **"Add user"** button

2. **Fill in details:**
   - **Email**: `test@aktiv.app`
   - **Password**: `TestUser123!`
   - **Auto Confirm**: ✅ Check this box (important!)
   - Click **"Create user"**

3. **Create User Profile:**
   - Go to Table Editor: https://supabase.com/dashboard/project/hticzqqxpsxccevtdhrb/editor
   - Click **"users"** table
   - Click **"Insert"** → **"Insert row"**
   - Fill in:
     - **id**: Copy the UUID from the auth user you just created
     - **email**: `test@aktiv.app`
     - **full_name**: `Test User`
     - **username**: `testuser`
     - **accountability_mode**: `true`
   - Click **"Save"**

4. **Login to your app:**
   - Go to: http://localhost:3000/login
   - **Email**: `test@aktiv.app`
   - **Password**: `TestUser123!`
   - Click **"Sign In"**

---

## Option 2: Use SQL (FASTER - 30 seconds)

### Steps:

1. **Go to SQL Editor:**
   - Open: https://supabase.com/dashboard/project/hticzqqxpsxccevtdhrb/sql/new

2. **Run this SQL:**

```sql
-- This will create a test user with email and password
-- Email: test@aktiv.app
-- Password: TestUser123!

-- Note: You need to create the auth user via dashboard first,
-- then get the UUID and use it below

-- After creating auth user in dashboard, insert profile:
INSERT INTO users (
  id,
  email,
  full_name,
  username,
  bio,
  accountability_mode,
  created_at
) VALUES (
  'PASTE_AUTH_USER_UUID_HERE', -- Replace with UUID from auth.users
  'test@aktiv.app',
  'Test User',
  'testuser',
  'Just testing the Aktiv app!',
  true,
  NOW()
);
```

---

## Option 3: Sign Up Normally (IF SIGNUP WORKS)

1. **Go to signup:**
   - http://localhost:3000/signup

2. **Create account:**
   - Email: `test@aktiv.app`
   - Password: `TestUser123!`
   - Full Name: `Test User`
   - Username: `testuser`

3. **Sign in:**
   - http://localhost:3000/login
   - Use the credentials above

---

## 🎯 RECOMMENDED: Option 1 (Supabase Dashboard)

**It's the easiest and most reliable!**

1. Add user via Auth tab
2. Copy the user UUID
3. Insert into users table with that UUID
4. Login at http://localhost:3000/login

---

## 📝 TEST CREDENTIALS:

**Email**: `test@aktiv.app`
**Password**: `TestUser123!`

---

## ⚠️ BEFORE YOU START:

Make sure ONE dev server is running:

```bash
cd /Users/nikhilbhima/Documents/Aktiv\ webapp/aktiv-app
npm run dev
```

Then go to: http://localhost:3000/login

---

**Once you create the account using Option 1, you can login and access the full dashboard!** 🚀
