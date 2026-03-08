# 🚀 Quick Fix: Login Issues After Deployment

## The Problems (3 Main Issues)

1. ❌ **Missing `.env` files** - Backend and frontend can't find configuration
2. ❌ **CORS locked to localhost** - Blocks requests from deployed frontend  
3. ❌ **Frontend doesn't know backend URL** - Tries to call localhost:5000 from production

---

## ✅ Quick Fixes (Already Implemented)

### ✓ Fixed Issues:

1. **CORS Configuration Updated** (`backend/server.js`)
   - Now reads `FRONTEND_URL` from environment variables
   - Dynamically allows configured domains
   - Logs CORS rejections for debugging

2. **JWT Secret Centralized** (`backend/middleware/auth.js` & `backend/services/authService.js`)
   - Consistent secret management
   - Warnings for production misconfigurations

3. **Environment Files Created:**
   - ✅ `backend/.env.local` - Development configuration
   - ✅ `backend/.env.production` - Production template
   - ✅ `gausetu-connect-main/.env.local` - Frontend dev
   - ✅ `gausetu-connect-main/.env.production` - Frontend production template

---

## 🎯 What You Need To Do NOW

### Step 1: Configure Backend for Your Deployment

**Edit:** `backend/.env.production`

```env
JWT_SECRET=<generate-secure-random-string>
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com
```

**To generate secure JWT_SECRET (run in terminal):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copy the output and paste as JWT_SECRET value**

---

### Step 2: Configure Frontend for Your Deployment

**Edit:** `gausetu-connect-main/.env.production`

```env
VITE_API_URL=https://your-backend-domain.com/api
```

**Replace `your-backend-domain.com` with:**
- Same domain if backend is on same server: `https://your-domain.com/api`
- Different server/subdomain: `https://api.your-domain.com/api`
- Different port: `https://your-domain.com:5000/api`

---

### Step 3: Deployment Steps

#### Backend:
```bash
cd backend

# Copy production env file
cp .env.production .env

# Install dependencies
npm install

# Start server
npm start  # or: node server.js
```

#### Frontend:
```bash
cd gausetu-connect-main

# Build with production environment
VITE_API_URL=https://your-backend-domain.com/api npm run build

# Serve the dist folder or upload to hosting
```

---

## ✅ Verification Checklist

After deployment, verify each step:

- [ ] Backend server is running (`http://your-domain:5000/health`)
- [ ] Frontend can reach backend (check browser Network tab)
- [ ] No CORS errors in browser console
- [ ] Login request succeeds and returns token
- [ ] Token is saved to localStorage
- [ ] Redirects to dashboard after login

---

## 🧪 Testing Login

### Test 1: Backend Health Check
```bash
curl https://your-domain.com:5000/health
# Should return: {"status":"Backend server is running with SQLite"}
```

### Test 2: Test Login Endpoint
```bash
curl -X POST https://your-backend-domain.com/api/auth/farmer/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@farmer.com","password":"demo123"}'
# Should return token if credentials are correct
```

### Test 3: Browser Console (Frontend)
1. Open frontend in browser
2. Press F12 (DevTools)
3. Go to Network tab
4. Try logging in
5. Check the POST request to `/api/auth/farmer/login`
6. Should see 200 status with token in response

---

## 🔧 Troubleshooting

### Issue: "CORS blocked"
```
Access to XMLHttpRequest blocked by CORS policy
```
**Fix:**
- Check `FRONTEND_URL` in backend `.env` matches your frontend domain
- Restart backend after changing `.env`
- Look for CORS warning in backend logs: `⚠️ CORS blocked request from origin:`

---

### Issue: "Cannot reach backend"
```
Failed to fetch from localhost:5000/api/...
```
**Fix:**
- Check `VITE_API_URL` in frontend `.env.production`
- Verify backend URL is correct and server is running
- Check network connectivity between frontend and backend

---

### Issue: "Invalid token"
```
401 - Token is not valid
```
**Fix:**
- Ensure `JWT_SECRET` is set in backend `.env`
- Verify same `JWT_SECRET` is used for token generation and verification
- Restart backend after changing JWT_SECRET

---

### Issue: "Login works locally but not in production"
**Checklist:**
- [ ] Is `FRONTEND_URL` set to production domain in backend `.env`?
- [ ] Is `VITE_API_URL` set to production backend URL in frontend `.env.production`?
- [ ] Are both services using same `JWT_SECRET`?
- [ ] Is backend server actually running on production server?
- [ ] Is firewall allowing connections between frontend and backend?

---

## 📊 Environment Variables Summary

| File | Variable | Dev Value | Prod Value |
|------|----------|-----------|-----------|
| `backend/.env` | `JWT_SECRET` | Any string | Generate with crypto |
| `backend/.env` | `FRONTEND_URL` | localhost URLs | Your production domain |
| `backend/.env` | `NODE_ENV` | development | production |
| `backend/.env` | `PORT` | 5000 | 5000 (or your port) |
| `frontend/.env.production` | `VITE_API_URL` | localhost:5000 | Your backend domain |

---

## 🔐 Security Tips

1. **Never commit `.env` files to git** - Add to `.gitignore`
2. **Use different JWT_SECRET per deployment** - Don't reuse
3. **Rotate JWT_SECRET periodically** - Changes security
4. **Use HTTPS in production** - Don't use HTTP
5. **Use environment variables** - Don't hardcode secrets

---

## 📞 Debug Commands

**Check if backend is running:**
```bash
ps aux | grep "node server.js"
```

**Check logs for errors:**
```bash
tail -f backend-logs.txt  # if logging to file
```

**Verify port is listening:**
```bash
netstat -an | grep 5000  # Unix/Mac
Get-NetTCPConnection -LocalPort 5000  # Windows PowerShell
```

**Test API directly:**
```bash
curl -v https://your-backend:5000/health
```

---

## 🎯 Success Indicators

✅ Login successful when:
1. Frontend makes POST to `/api/auth/farmer/login`
2. Backend returns `{"success":true,"token":"...","user":{...}}`
3. No CORS errors in browser console
4. Token saved to `localStorage`
5. User redirected to dashboard

You're all set! The issues are fixed and files are configured. Just update the .env files with your production URLs and you should be good to go.
