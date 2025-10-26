# Create Test User - SIMPLE METHOD (30 seconds)

## Test Account Credentials:
- **Email**: `test@aktiv.app`
- **Password**: `TestUser123!`

---

## STEP 1: Create Auth User (Supabase Dashboard)

1. Go to: https://supabase.com/dashboard/project/hticzqqxpsxccevtdhrb/auth/users
2. Click **"Add user"** button (top right)
3. Select **"Create new user"**
4. Fill in:
   - **Email**: `test@aktiv.app`
   - **Password**: `TestUser123!`
   - **Auto Confirm User**: ✅ CHECK THIS BOX
5. Click **"Create user"**
6. **COPY THE USER ID** (UUID) - you'll need it for Step 2

---

## STEP 2: Create User Profile (SQL Editor)

1. Go to: https://supabase.com/dashboard/project/hticzqqxpsxccevtdhrb/sql/new
2. Copy the SQL below
3. **REPLACE** `YOUR_USER_UUID_HERE` with the UUID you copied from Step 1
4. Click **"Run"**

```sql
-- Insert user profile
INSERT INTO users (
  id,
  email,
  full_name,
  username,
  bio,
  accountability_mode,
  created_at,
  updated_at
) VALUES (
  'YOUR_USER_UUID_HERE', -- REPLACE THIS with the UUID from Step 1
  'test@aktiv.app',
  'Test User',
  'testuser',
  'Testing the Aktiv app!',
  true,
  NOW(),
  NOW()
);
```

---

## STEP 3: Login

1. Go to: http://localhost:3000/login
2. Enter:
   - Email: `test@aktiv.app`
   - Password: `TestUser123!`
3. Click **"Sign In"**

You should now see the dashboard!

---

## If login page doesn't exist yet:

You can also access the dashboard directly at:
- http://localhost:3000/dashboard

The auth system should automatically recognize your session.

---

## Need Help?

If you see any errors, let me know and I'll help troubleshoot!
