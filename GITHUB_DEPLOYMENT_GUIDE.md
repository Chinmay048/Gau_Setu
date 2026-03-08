# 🚀 GitHub Deployment Guide

## Complete Setup Instructions

### Prerequisites
- GitHub account
- Vercel account (free)
- Node.js 18+

---

## Step 1: Prepare Your Local Repository

### 1.1 Initialize Git (if not already done)
```bash
cd e:\hackathon\Gau_Setu
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 1.2 Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Create repository: `Gau_Setu` (or your preferred name)
3. **Important:** Don't initialize with README (we already have one)
4. Click "Create repository"

### 1.3 Add Remote and Push Code
```bash
git remote add origin https://github.com/YOUR_USERNAME/Gau_Setu.git
git branch -M main
git add .
git commit -m "Initial commit: Gau Setu livestock management system"
git push -u origin main
```

---

## Step 2: Setup GitHub Secrets

These are required for automated deployment!

### 2.1 Add Frontend API URL
1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add these secrets:

**Secret Name:** `VITE_API_URL`
**Value:** `https://your-backend.vercel.app/api` (you'll update this after backend deploys)

### 2.2 Add Backend Secrets (for Vercel)
Add these secrets:

**Secret Name:** `VERCEL_TOKEN`
**Value:** [Get from Vercel - See Step 3.1]

**Secret Name:** `VERCEL_ORG_ID`  
**Value:** [Get from Vercel - See Step 3.1]

**Secret Name:** `VERCEL_PROJECT_ID`
**Value:** [Get from Vercel - See Step 3.1]

**Secret Name:** `JWT_SECRET`
**Value:** Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**Secret Name:** `FRONTEND_URL`
**Value:** `https://YOUR_USERNAME.github.io/Gau_Setu/`

---

## Step 3: Setup Vercel Deployment

### 3.1 Create Vercel Account & Get Tokens

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Go to **Settings** → **Tokens**
4. Create new token → Copy it
5. Paste into GitHub Secret: `VERCEL_TOKEN`

### 3.2 Get Vercel Project IDs

1. In Vercel dashboard, click on your team/org
2. Go to **Settings** → **General**
   - Copy **Team ID** → GitHub Secret: `VERCEL_ORG_ID`
3. Create a new project manually:
   - Click "Add New..." → "Project"
   - Import from GitHub → Select `Gau_Setu`
   - Skip configuration
   - After creation, go to project settings
   - Copy **Project ID** → GitHub Secret: `VERCEL_PROJECT_ID`

### 3.3 Configure Vercel Backend

```bash
cd backend

# Create vercel.json (already done - check it exists)

# Deploy manually first (optional but recommended)
npm install -g vercel
vercel --prod
```

---

## Step 4: Enable GitHub Pages

### 4.1 Configure GitHub Pages Settings
1. Go to your GitHub repo → **Settings** → **Pages**
2. **Source:** Select "GitHub Actions" (not Branch)
3. Save

### 4.2 Verify Workflow Permissions
1. Go to **Settings** → **Actions** → **General**
2. Under "Workflow permissions" select:
   - ✅ "Read and write permissions"
   - ✅ "Allow GitHub Actions to create and approve pull requests"

---

## Step 5: First Deployment

### 5.1 Trigger Workflows
1. Make a commit to trigger workflows:
```bash
git add .
git commit -m "Setup: Add deployment configuration"
git push origin main
```

2. Watch the workflows:
   - Go to **Actions** tab
   - See "Deploy Frontend to GitHub Pages" and "Deploy Backend to Vercel"

### 5.2 Monitor Deployments

**Frontend:**
- Wait for "Deploy Frontend to GitHub Pages" to complete
- Check `https://YOUR_USERNAME.github.io/Gau_Setu/`

**Backend:**
- Check "Deploy Backend to Vercel" 
- Note the Vercel deployment URL
- Update GitHub Secret `VITE_API_URL` with actual backend URL

---

## Step 6: Update Configuration After First Deploy

### 6.1 Get Backend URL
1. Go to Vercel dashboard
2. Find your project
3. Copy the deployment URL (e.g., `https://gau-setu-backend.vercel.app`)

### 6.2 Update GitHub Secrets
1. Go to GitHub repo → Settings → Secrets
2. Edit `VITE_API_URL`:
   - Old: `https://your-backend.vercel.app/api`
   - New: `https://gau-setu-backend.vercel.app/api` (your actual URL)

3. Edit `FRONTEND_URL`:
   - Should be: `https://YOUR_USERNAME.github.io/Gau_Setu/`

### 6.3 Redeploy Frontend
```bash
# Modify a file slightly to trigger re-deployment
echo "# Updated" >> README.md
git add .
git commit -m "chore: Trigger frontend redeploy with correct backend URL"
git push origin main
```

---

## 🎯 Final URLs

After deployment, you'll have:

| Service | URL |
|---------|-----|
| **Frontend** | `https://YOUR_USERNAME.github.io/Gau_Setu/` |
| **Backend API** | `https://gau-setu-backend.vercel.app/api/` |
| **GitHub Repo** | `https://github.com/YOUR_USERNAME/Gau_Setu` |

---

## 🔄 Workflow: Making Changes

Once deployed, here's how to make updates:

```bash
# Make code changes
# ... edit files ...

# Test locally
npm run dev  # frontend
npm start    # backend

# Push to GitHub (triggers auto-deployment)
git add .
git commit -m "feat: Add new feature"
git push origin main

# Workflows automatically:
# 1. Build frontend
# 2. Deploy to GitHub Pages  
# 3. Build backend
# 4. Deploy to Vercel
```

---

## 🧪 Testing Deployment

### Test 1: Frontend Loads
```bash
curl https://YOUR_USERNAME.github.io/Gau_Setu/
# Should return HTML
```

### Test 2: Backend API Works
```bash
curl https://gau-setu-backend.vercel.app/health
# Should return: {"status":"Backend server is running with SQLite"}
```

### Test 3: Login Works
1. Open frontend in browser
2. Try login with demo credentials
3. Check Network tab for successful API call
4. Should redirect to dashboard

---

## ❌ Troubleshooting

### Issue: "CORS is blocked"
```
Access to XMLHttpRequest blocked by CORS policy
```

**Fix:**
1. Check `FRONTEND_URL` in backend `.env`
2. Should be: `https://YOUR_USERNAME.github.io/Gau_Setu/`
3. Or set in GitHub Secret and redeploy

### Issue: Frontend can't find backend
```
Failed to fetch from localhost:5000
```

**Fix:**
1. Check `VITE_API_URL` GitHub Secret
2. Update to actual Vercel backend URL
3. Redeploy frontend

### Issue: Workflow fails with "No permissions"
**Fix:**
1. Go to Settings → Actions → General
2. Select "Read and write permissions"
3. Check "Allow workflow to create pull requests"

### Issue: GitHub Pages showing 404
**Fix:**
1. Check Settings → Pages → Source is "GitHub Actions"
2. Check workflow completed successfully
3. Wait a few minutes for DNS to propagate

### Issue: Backend deployment fails
**Fix:**
1. Check Vercel secrets are set correctly
2. Check `backend/vercel.json` exists
3. Verify `backend/package.json` has start script
4. Check backend code has no syntax errors

---

## 📋 Complete Checklist

- [ ] Local git repository initialized
- [ ] GitHub repository created
- [ ] Code pushed to main branch
- [ ] GitHub Pages enabled (Settings → Pages → GitHub Actions)
- [ ] Workflow permissions set correctly
- [ ] Vercel account created
- [ ] Vercel token generated and added to GitHub Secrets
- [ ] `VITE_API_URL` GitHub Secret added (temporary value OK)
- [ ] Workflows completed successfully
- [ ] Frontend accessible at GitHub Pages URL
- [ ] Backend accessible at Vercel URL
- [ ] GitHub Secret `VITE_API_URL` updated with real backend URL
- [ ] Frontend redeployed with correct backend URL
- [ ] Login tested and working

---

## 📚 Additional Resources

- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel Docs](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

## 🎉 You're Live!

Your full-stack application is now deployed and automatically updated on every push to main branch!

**Frontend:** https://YOUR_USERNAME.github.io/Gau_Setu/
**Backend:** https://your-backend.vercel.app/api/

Every time you push code:
1. GitHub Actions builds frontend & backend
2. Frontend deploys to GitHub Pages
3. Backend deploys to Vercel
4. All automated! 🚀
