# Aktiv App - Complete Deployment Guide

This guide will walk you through deploying your Aktiv app to production using Supabase and Vercel.

---

## Part 1: Supabase Setup (Backend)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click **"New Project"**
4. Fill in details:
   - **Organization**: Select or create one
   - **Name**: `aktiv-app` (or your preferred name)
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to your users (e.g., `ap-south-1` for India)
   - **Pricing Plan**: Free tier is fine for starting
5. Click **"Create new project"**
6. Wait 2-3 minutes for setup to complete

### Step 2: Enable PostGIS Extension

1. In your Supabase dashboard, go to **Database** → **Extensions**
2. Search for `postgis`
3. Click **Enable** next to PostGIS
4. Wait for it to activate (should take a few seconds)

### Step 3: Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Open the file `/supabase-setup.sql` from your project
4. Copy ALL the contents
5. Paste into the SQL Editor
6. Click **"Run"** or press `Ctrl/Cmd + Enter`
7. You should see "Success. No rows returned" (this is good!)

**What this does:**
- Creates all database tables (users, goals, matches, messages, etc.)
- Sets up Row Level Security (RLS) policies
- Creates database functions and triggers
- Configures storage buckets for images

### Step 4: Create Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Click **"Create a new bucket"**
3. Create these buckets:

**Bucket 1: avatars**
- Name: `avatars`
- Public: ✅ Yes
- File size limit: 2 MB
- Allowed file types: `image/*`

**Bucket 2: checkins**
- Name: `checkins`
- Public: ✅ Yes
- File size limit: 5 MB
- Allowed file types: `image/*`, `video/*`

### Step 5: Get API Keys

1. Go to **Settings** → **API**
2. Copy these values (you'll need them for Vercel):

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Part 2: Vercel Deployment (Frontend)

### Step 1: Prepare Your GitHub Repository

Make sure all your code is committed and pushed to GitHub (we'll do this in the next section).

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Find your `Aktiv` repository
5. Click **"Import"**

### Step 3: Configure Environment Variables

In the Vercel import screen, add these environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

(Use the values you copied from Supabase in Part 1, Step 5)

### Step 4: Deploy Settings

- **Framework Preset**: Next.js (should auto-detect)
- **Root Directory**: `./` (leave as is)
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (should auto-fill)
- **Install Command**: `npm install`

Click **"Deploy"**

### Step 5: Wait for Deployment

- First deployment takes 2-5 minutes
- You'll see build logs in real-time
- Once complete, you'll get a URL like: `https://aktiv-xxxx.vercel.app`

### Step 6: Test Your Deployment

1. Open your Vercel URL
2. You should see the landing page with splash screen
3. Click **"Sign Up"** and create a test account
4. Create a goal
5. Go to Discover tab
6. Everything should work!

---

## Part 3: Custom Domain (Optional)

### Step 1: Purchase Domain

Buy a domain from:
- [Namecheap](https://namecheap.com)
- [GoDaddy](https://godaddy.com)
- [Google Domains](https://domains.google)

Example: `aktiv.app`, `myaktiv.com`, etc.

### Step 2: Add Domain to Vercel

1. In Vercel dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Enter your domain (e.g., `aktiv.app`)
4. Click **"Add"**

### Step 3: Configure DNS

Vercel will show you DNS records to add. Go to your domain provider and add:

**For apex domain (aktiv.app):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 4: Wait for DNS Propagation

- Takes 5 minutes to 48 hours (usually ~30 minutes)
- Vercel will automatically provision SSL certificate
- Your app will be live at your custom domain!

---

## Part 4: Post-Deployment Configuration

### Update Supabase Auth Settings

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Site URL**: `https://aktiv-xxxx.vercel.app`
3. Add to **Redirect URLs**:
   ```
   https://aktiv-xxxx.vercel.app/auth/callback
   https://aktiv-xxxx.vercel.app/reset-password
   ```

### Enable Email Auth (Optional)

1. Go to **Authentication** → **Providers**
2. Configure email templates:
   - Confirmation email
   - Password reset email
   - Magic link email

---

## Part 5: Monitoring & Analytics

### Vercel Analytics

1. In Vercel dashboard, go to **Analytics** tab
2. Enable **Web Analytics** (free)
3. Monitor page views, performance, user behavior

### Supabase Logs

1. Go to **Logs** in Supabase dashboard
2. Monitor:
   - Database queries
   - API requests
   - Errors and warnings

---

## Troubleshooting

### Build Fails on Vercel

**Error: "Module not found"**
```bash
# Solution: Make sure package.json is correct
npm install
npm run build
# If it works locally, commit and push again
```

**Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"**
```bash
# Solution: Double-check environment variables in Vercel
# Settings → Environment Variables
```

### Database Errors

**Error: "relation does not exist"**
```bash
# Solution: Re-run the SQL migration
# Make sure you ran the complete supabase-setup.sql file
```

**Error: "new row violates row-level security policy"**
```bash
# Solution: RLS policies might not be set up correctly
# Re-run the migration or check Supabase Database → Policies
```

### Auth Issues

**Can't sign up/login**
```bash
# Check:
# 1. Environment variables are correct in Vercel
# 2. Site URL is configured in Supabase
# 3. Email auth is enabled in Supabase
```

---

## Useful Commands

### Local Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Check for errors
```

### Git Commands
```bash
git status           # Check changes
git add .            # Stage all changes
git commit -m "msg"  # Commit with message
git push             # Push to GitHub
```

### Vercel CLI (Optional)
```bash
npm i -g vercel      # Install Vercel CLI
vercel login         # Login
vercel               # Deploy from command line
vercel --prod        # Deploy to production
```

---

## Production Checklist

Before going live, make sure:

- [x] ✅ All database migrations run successfully
- [x] ✅ Storage buckets created (avatars, checkins)
- [x] ✅ Environment variables set in Vercel
- [x] ✅ Site URL configured in Supabase
- [x] ✅ Tested signup/login flow
- [x] ✅ Tested goal creation
- [x] ✅ Tested matching system
- [x] ✅ Tested chat functionality
- [x] ✅ Tested check-ins with image upload
- [x] ✅ Tested on mobile devices
- [x] ✅ SSL certificate active (https://)
- [x] ✅ Analytics enabled

---

## Support & Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)

### Community
- [Supabase Discord](https://discord.supabase.com)
- [Next.js Discord](https://discord.gg/nextjs)

### Aktiv App Specific
- GitHub Repository: `https://github.com/nikhilbhima/Aktiv`
- Issues: Report bugs on GitHub Issues

---

## Scaling Considerations

### When You Outgrow Free Tier

**Supabase:**
- Free: 500MB database, 2GB bandwidth
- Pro ($25/mo): 8GB database, 250GB bandwidth
- Upgrade when you hit limits

**Vercel:**
- Free: 100GB bandwidth
- Pro ($20/mo): 1TB bandwidth
- Upgrade when needed

### Performance Optimization

1. **Enable caching** in Vercel
2. **Optimize images** (use Next.js Image component)
3. **Add Redis** for session management (optional)
4. **CDN** for static assets
5. **Database indexes** for frequently queried fields

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs in Vercel
- Monitor database performance in Supabase
- Review user feedback

**Monthly:**
- Review analytics
- Update dependencies (`npm update`)
- Backup database (Supabase auto-backups daily)

**As Needed:**
- Deploy bug fixes
- Add new features
- Scale resources

---

**You're all set! 🎉**

Your Aktiv app is now live and ready to help people achieve their goals together.

Need help? Check the troubleshooting section or create an issue on GitHub.

---

**Generated for Aktiv App Deployment**
**Last Updated:** 2025
