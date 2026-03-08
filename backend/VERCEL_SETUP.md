# Vercel Backend Deployment Configuration

## Files Included

1. **vercel.json** - Deployment configuration for Vercel
2. **.vercelignore** - Files to ignore during deployment
3. **GitHub Actions Workflow** - Automatically deploys on git push

## Quick Start

### Local Testing
```bash
cd backend
npm install
npm start
```

### Deploy to Vercel

#### Option 1: Command Line
```bash
npm install -g vercel
vercel --prod
```

#### Option 2: GitHub Actions (Automatic)
Push to `main` branch and workflows will deploy automatically

### Environment Variables

Set these in Vercel Dashboard:
- `NODE_ENV=production`
- `JWT_SECRET=your-secure-secret`
- `FRONTEND_URL=https://your-frontend-domain.com`

## Vercel Free Tier Benefits

✅ Automatic HTTPS
✅ Global CDN
✅ Automatic deployments from Git
✅ Environment variables support
✅ Serverless functions support
✅ Database connections allowed
✅ Always-on deployments (for paid, but production-grade)

See: https://vercel.com/pricing
