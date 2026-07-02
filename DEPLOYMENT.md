# 🚀 AgriNex AI — Deployment Guide

> **Stack**: Next.js 15 (Vercel) + Express.js (Railway) + Supabase (PostgreSQL + Storage)

---

## ✅ Pre-Deployment Checklist

Before deploying, confirm you have:
- [ ] Supabase project created with schema applied
- [ ] Supabase URL and keys (from Supabase Dashboard → Settings → API)
- [ ] Google Gemini API key (from https://ai.google.dev)
- [ ] Railway account (https://railway.app)
- [ ] Vercel account (https://vercel.com)
- [ ] GitHub repository with your code pushed

---

## 1️⃣ Supabase Setup (Database + Storage)

### 1.1 Create Project
1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Note your **Project URL** and **anon key** from **Settings → API**
3. Note the **service_role key** (keep secret — backend only)

### 1.2 Apply Database Schema
1. Go to **SQL Editor** in Supabase Dashboard
2. Paste and run the contents of `supabase/schema.sql`
3. Verify all tables exist: `profiles`, `products`, `orders`, `order_items`, `reviews`, `notifications`

### 1.3 Enable Auth
1. Go to **Authentication → Providers**
2. Enable **Email** (enabled by default)
3. Optionally enable **Google OAuth** (add Google Client ID + Secret)

### 1.4 Create Storage Buckets
1. Go to **Storage → New bucket**
2. Create **`crop-images`** → Toggle **Public** ON
3. Create **`land-docs`** → Leave **Public** OFF (private)

### 1.5 Apply Storage Policies
1. Go to **SQL Editor**
2. Paste and run `supabase/storage_policies.sql`

---

## 2️⃣ Railway — Backend Deployment

### Option A: Railway CLI (if installed)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize in project root
railway init

# Deploy
railway up

# Open dashboard to add environment variables
railway open
```

### Option B: GitHub Deployment (Recommended — No CLI needed)

1. Push your code to **GitHub**
2. Go to [railway.app](https://railway.app) → **New Project**
3. Select **"Deploy from GitHub repo"**
4. Select your repository
5. Railway auto-detects Node.js

### 2.1 Configure Railway Build Settings

In Railway Dashboard → Your Service → **Settings**:

| Setting | Value |
|---------|-------|
| **Root Directory** | `/` (repo root) |
| **Build Command** | `npm run build:backend` |
| **Start Command** | `npm run start:backend` |
| **Watch Paths** | `src/backend/**` |

### 2.2 Add Environment Variables in Railway

Go to **Variables** tab and add:

```
PORT=4000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGIN=https://your-app.vercel.app
```

> ⚠️ **Important**: Set `CORS_ORIGIN` to your Vercel URL **after** step 3.

### 2.3 Get Railway Backend URL

After deployment, Railway gives you a URL like:
```
https://agrinex-api-production.up.railway.app
```

Copy this — you'll need it for Vercel.

---

## 3️⃣ Vercel — Frontend Deployment

### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (run from c:\ass2)
vercel --prod
```

### Option B: GitHub Integration (Recommended)

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Vercel auto-detects **Next.js**

### 3.1 Configure Vercel Build Settings

| Setting | Value |
|---------|-------|
| **Framework** | Next.js (auto-detected) |
| **Root Directory** | `/` |
| **Build Command** | `npm run build:frontend` |
| **Output Directory** | `.next` |
| **Install Command** | `npm install` |

### 3.2 Add Environment Variables in Vercel

Go to **Project Settings → Environment Variables** and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://agrinex-api-production.up.railway.app
NEXT_PUBLIC_API_BASE_URL=https://agrinex-api-production.up.railway.app
```

### 3.3 After Vercel Deploys

1. Copy your Vercel URL: `https://agrinex-ai.vercel.app`
2. Go back to Railway → Variables → Update `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=https://agrinex-ai.vercel.app
   ```
3. Railway will automatically redeploy with the new variable.

---

## 4️⃣ Post-Deployment Verification

### 4.1 Health Check
```
GET https://agrinex-api-production.up.railway.app/health
```
Expected response:
```json
{ "status": "ok", "service": "AgriNex AI Backend" }
```

### 4.2 Smoke Test

| Test | Steps |
|------|-------|
| **Sign Up** | Visit Vercel URL → Create Farmer account |
| **AI Grader** | Upload crop photo → Wait for Grade result |
| **Voice** | Click mic button → Speak a command |
| **Marketplace** | Browse products as Consumer |
| **Tracking** | Place order → Track on map |
| **Admin** | Log in as Admin → Review KYC |

---

## 5️⃣ Production Environment Summary

### Frontend `.env.local` (for local dev — DO NOT commit)
```env
NEXT_PUBLIC_SUPABASE_URL=https://kqmabbfjyrnvjcqkfxjy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_API_BASE_URL=
```

### Vercel Environment Variables (Production)
```env
NEXT_PUBLIC_SUPABASE_URL=https://kqmabbfjyrnvjcqkfxjy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_API_URL=https://agrinex-api-production.up.railway.app
NEXT_PUBLIC_API_BASE_URL=https://agrinex-api-production.up.railway.app
```

### Railway Environment Variables (Production)
```env
PORT=4000
SUPABASE_URL=https://kqmabbfjyrnvjcqkfxjy.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
GEMINI_API_KEY=<your-gemini-key>
CORS_ORIGIN=https://agrinex-ai.vercel.app
```

---

## 6️⃣ Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS error in browser | Verify `CORS_ORIGIN` on Railway matches exact Vercel URL |
| Supabase 401 errors | Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct |
| AI grading fails | Check `GEMINI_API_KEY` on Railway; verify it's not expired |
| Map not loading | Leaflet is dynamically imported — check browser console for CSP errors |
| Voice not working | Web Speech API requires HTTPS in production (auto on Vercel) |
| Images not serving | Verify `crop-images` bucket is set to **Public** in Supabase |

---

## 7️⃣ Custom Domain (Optional)

### Vercel Custom Domain
1. Vercel Dashboard → Project → **Domains**
2. Add your custom domain
3. Update DNS CNAME record as instructed

### After Custom Domain
Update `CORS_ORIGIN` on Railway to match: `https://your-custom-domain.com`

---

*AgriNex AI — Empowering Indian farmers through technology, transparency, and AI.*
