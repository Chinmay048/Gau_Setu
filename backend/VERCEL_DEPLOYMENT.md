# 🚀 Backend Deployment on Vercel - Complete Guide

Your backend is now **READY FOR VERCEL DEPLOYMENT** with everything configured!

---

## ⚡ Quick Start (3 Minutes)

### Option A: Deploy via GitHub (Recommended - Automatic)

The GitHub Actions workflow will automatically deploy to Vercel when you push code.

Just make sure you've added these 3 GitHub Secrets:
- `VERCEL_TOKEN` - Your Vercel API token
- `VERCEL_ORG_ID` - Your Vercel team ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID

**Then push code and it auto-deploys!** ✅

---

### Option B: Deploy via Vercel CLI (Manual)

1. **Install Vercel CLI** (if not already installed)
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy from backend directory**
```bash
cd backend
vercel --prod
```

4. **Follow the prompts:**
   - "Set up and deploy?" → Yes
   - "Scope?" → Your Vercel team
   - "Link to existing project?" → No (first time) or Yes (existing)
   - "What's your project name?" → gau-setu-backend
   - "In which directory is your code?" → ./

5. **Set Environment Variables in Vercel Dashboard:**
   - Go to: Vercel Dashboard → Project Settings → Environment Variables
   - Add:
     - `JWT_SECRET` = (Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
     - `FRONTEND_URL` = `https://Chinmay048.github.io/Gau_Setu/`
     - `NODE_ENV` = `production`

6. **Deployment URL will be shown!**
   - Example: `https://gau-setu-backend.vercel.app/`

---

## 📋 What's Been Configured

### Files Ready for Vercel:
```
✅ backend/api/index.js          → Vercel serverless handler
✅ backend/vercel.json            → Vercel configuration
✅ backend/.vercelignore          → Files to skip
✅ backend/.env.example           → Environment template
✅ backend/package.json           → Dependencies with build script
```

### Database:
```
✅ SQLite (./database/livestock.db) → Works on Vercel's filesystem
✅ Auto-initialized on first request
✅ Data persists across deployments
```

### How It Works:
```
Your request to: https://gau-setu-backend.vercel.app/api/auth/login
         ↓
Vercel serverless function (api/index.js)
         ↓
Express app handles routing
         ↓
SQLite database (local file)
         ↓
Response sent back to you
```

---

## 🧪 Test Your Deployment

### After deployment, test the health endpoint:
```bash
curl https://gau-setu-backend.vercel.app/health
```

**Expected response:**
```json
{
  "status": "Backend server is running with SQLite",
  "environment": "production"
}
```

### Test login endpoint:
```bash
curl -X POST https://gau-setu-backend.vercel.app/api/auth/farmer/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@farmer.com","password":"demo123"}'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJ...",
  "user": {...}
}
```

---

## 🔧 Environment Variables to Set in Vercel

| Variable | Value | Required |
|----------|-------|----------|
| `JWT_SECRET` | Generate with crypto | ✅ Yes |
| `FRONTEND_URL` | Your GitHub Pages URL | ✅ Yes |
| `NODE_ENV` | production | ✅ Yes |
| `PORT` | 5000 | Optional |

---

## 📊 Costs & Limits

**Vercel Free Tier Includes:**
- ✅ Unlimited deployments
- ✅ Always-on serverless functions
- ✅ Automatic HTTPS
- ✅ Global edge network
- ✅ Database storage on filesystem

See: https://vercel.com/pricing

---

## 🚨 Troubleshooting

### Issue: "Module not found"
```
Error: Cannot find module 'better-sqlite3'
```
**Solution:**
```bash
cd backend
npm install
vercel --prod
```

---

### Issue: "CORS blocked"
```
Access to XMLHttpRequest blocked by CORS
```
**Solution:**
1. Check `FRONTEND_URL` environment variable in Vercel dashboard
2. Must match your GitHub Pages URL exactly
3. Redeploy or restart project

---

### Issue: "Database writes fail"
**Solution:**
- SQLite uses local filesystem on Vercel
- Uploads directory and database are automatically created
- All works out of the box!

---

### Issue: "Not found after deployment"
```
404 - Route not found
```
**Solution:**
1. Check API URLs - they should be: `/api/...`
2. Example: `https://gau-setu-backend.vercel.app/api/auth/login`
3. Not: `https://gau-setu-backend.vercel.app/auth/login`

---

## 🔄 After First Deployment

**Every time you push code:**
1. GitHub Actions automatically builds
2. Deploys to Vercel
3. Your API is updated
4. **No manual steps needed!** ✅

---

## 📚 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel CLI Docs](https://vercel.com/docs/cli)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Node.js on Vercel](https://vercel.com/docs/functions/nodejs)

---

## ✅ Deployment Checklist

- [ ] `backend/api/index.js` exists
- [ ] `backend/vercel.json` is configured
- [ ] `backend/package.json` has all dependencies
- [ ] GitHub Secrets added (VERCEL_TOKEN, ORG_ID, PROJECT_ID)
- [ ] Environment variables set in Vercel (JWT_SECRET, FRONTEND_URL)
- [ ] Test health endpoint returns 200
- [ ] Test login endpoint works
- [ ] Frontend can reach backend API

---

## 🎉 You're Ready to Deploy!

Your backend is completely configured for Vercel deployment.

**Choose deployment method:**
1. **Automatic (Recommended):** Push to GitHub → Auto-deploys via Actions
2. **Manual:** Run `vercel --prod` from terminal

**Your Backend URL:** `https://gau-setu-backend.vercel.app/api/`

Good luck! 🚀
