# Farmer Dashboard - Complete Setup Guide

## 🎯 What's Been Created

Your complete MERN stack livestock management system with:

✅ **Backend (Node.js + Express + MongoDB)**
- 7 database models with relationships
- 5 service layers for business logic
- 5 controllers handling API requests
- 5 route files with protected endpoints
- JWT authentication with role-based access
- Complete error handling

✅ **Frontend (React + Vite + Tailwind CSS)**
- 9 page components
- 5+ reusable glassmorphic components
- React Context for state management
- Custom hooks (useAuth, useCow, useCamera)
- API service layer with Axios
- Responsive design with Tailwind CSS

✅ **Database Schema**
- Farmer, Vet, Cow, Biometric, Vaccination, VetReport, OwnershipTransfer

## 📂 Project Structure

```
Cow/
├── backend/
│   ├── config/             # Database & constants
│   ├── models/             # 7 MongoDB schemas
│   ├── routes/             # 5 route files
│   ├── controllers/        # 5 controller files
│   ├── middleware/         # Auth, RBAC, error handling
│   ├── services/           # 5 service files
│   ├── server.js           # Express app
│   ├── package.json        # Dependencies
│   ├── .env.example        # Environment template
│   └── README.md           # Backend docs
│
├── frontend/
│   ├── src/
│   │   ├── pages/          # 9 page components
│   │   ├── components/     # Glassmorphic UI components
│   │   ├── context/        # Auth & Cow context
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API integration
│   │   ├── utils/          # Helper functions
│   │   ├── App.jsx         # Routing setup
│   │   ├── main.jsx        # React root
│   │   └── index.css       # Global styles
│   ├── index.html          # HTML entry point
│   ├── vite.config.js      # Vite configuration
│   ├── tailwind.config.js  # Tailwind setup
│   ├── postcss.config.js   # PostCSS config
│   ├── package.json        # Dependencies
│   ├── .env.example        # Environment template
│   └── README.md           # Frontend docs
│
├── README.md               # Project overview
└── SETUP.md               # This file
```

## 🚀 Step-by-Step Setup

### Phase 1: Backend Setup

#### Step 1.1: Navigate to backend
```bash
cd backend
```

#### Step 1.2: Copy environment template
```bash
cp .env.example .env
```

#### Step 1.3: Configure .env

Edit `backend/.env`:

```env
# REQUIRED - MongoDB Setup
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/farmers_db
# Get this from MongoDB Atlas -> Connect -> Connection String

# REQUIRED - JWT Configuration
JWT_SECRET=generate_a_long_random_string_here_minimum_32_chars
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Optional - For breed detection model
BREED_MODEL_ENDPOINT=http://localhost:5001/predict
BREED_MODEL_API_KEY=your_model_api_key
```

**How to get MongoDB URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create a cluster
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Replace `<username>` and `<password>` with your credentials

#### Step 1.4: Install dependencies
```bash
npm install
```

#### Step 1.5: Start backend server
```bash
npm run dev
```

**Expected output:**
```
✓ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
✓ Server running on port 5000
✓ Environment: development
```

### Phase 2: Frontend Setup

#### Step 2.1: Navigate to frontend
```bash
cd frontend
```

#### Step 2.2: Copy environment template
```bash
cp .env.example .env.local
```

#### Step 2.3: Configure .env.local

Edit `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
```

#### Step 2.4: Install dependencies
```bash
npm install
```

#### Step 2.5: Start frontend server
```bash
npm run dev
```

**Expected output:**
```
VITE v4.4.5 ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### Phase 3: Access the Application

1. Open browser: `http://localhost:5173`
2. You should see the homepage with login options

## 🧪 Testing the Application

### Test 1: Farmer Registration & Login

1. Click "Register Farm"
2. Fill in farm details:
   - Email: `farmer@test.com`
   - Farm Name: `Test Farm`
   - Phone: `9876543210`
   - Location: `Test Location`
   - Password: `Test123!`
3. Click "Register"
4. You'll see dashboard
5. Click "Register New Cow"

### Test 2: Register a Cow

1. Click "+ Register New Cow"
2. Choose "Newborn Calf"
3. Enter RFID: `RF001`
4. Select Gender: Female
5. Enter Birth Date: Today's date
6. Click "Next"
7. Take a photo (click "Start Camera" → "Capture")
8. Click "Next"
9. (Optional) Enter Father/Mother RFID
10. Click "Next"
11. Review and click "Confirm & Register"

### Test 3: Vet Registration & Login

1. Go back to homepage
2. Click "Register Clinic"
3. Fill in vet details
4. Submit (will show "pending approval" message)
5. For testing, manually change status in MongoDB or proceed with farmer login

## 🔧 Troubleshooting

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED
```
**Solution:**
- Check MongoDB URI in .env is correct
- Verify IP is whitelisted in MongoDB Atlas Security
- Ensure internet connection is stable

### Frontend Can't Connect to Backend
```
Network Error: Failed to fetch
```
**Solution:**
- Verify backend is running (`npm run dev` in backend folder)
- Check VITE_API_URL in frontend/.env.local
- Ensure http://localhost:5000 is accessible

### Camera Permission Denied
**Solution:**
- Chrome/Firefox: Allow camera in browser permissions
- Safari: Settings → Privacy → Camera → Allow
- Some browsers require HTTPS for camera (production)

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Kill process on port 5000 (Windows PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# Or change port in .env
PORT=5001
```

## 📋 API Endpoints Quick Reference

### Health Check
```
GET http://localhost:5000/health
```

### Farmer Login
```bash
POST http://localhost:5000/api/auth/farmer/login
{
  "email": "farmer@test.com",
  "password": "Test123!"
}
```

### Get My Cows
```bash
GET http://localhost:5000/api/cows/my-cows
Headers: Authorization: Bearer <token>
```

### Create Cow
```bash
POST http://localhost:5000/api/cows/register/newborn
Headers: Authorization: Bearer <token>
{
  "rfidNumber": "RF001",
  "gender": "female",
  "birthDate": "2024-03-07",
  "photoUrl": "base64_image_data"
}
```

## 🔐 Security Reminders

⚠️ **Before Production:**

1. Change `JWT_SECRET` to a strong random value
2. Enable HTTPS
3. Use strong MongoDB password
4. Enable production MongoDB backups
5. Set `NODE_ENV=production`
6. Remove console logs
7. Implement rate limiting
8. Add CSRF protection
9. Validate all user inputs
10. Set environment-specific CORS origins

## 📦 Build for Production

### Frontend Build
```bash
cd frontend
npm run build
# Creates optimized ./dist folder
```

### Backend Production Start
```bash
cd backend
npm run start
# Uses standard node (not nodemon)
```

## 💡 Next Steps

### Implement Breed Detection
1. Get your AI model running
2. Set `BREED_MODEL_ENDPOINT` in backend/.env
3. Update `breedDetectionService.js` with your model API

### Deploy to Cloud

**Frontend (Vercel/Netlify):**
```bash
# Build locally
npm run build

# Deploy dist folder
```

**Backend (Heroku/Railway):**
```bash
# Add Procfile
web: node server.js

# Deploy with git
git push heroku main
```

### Enable SMS/Email Notifications
- Integrate Twilio for SMS
- Integrate SendGrid for emails
- Add phone number to Farmer model
- Create notification service

### Add Real RFID Scanner Integration
- Use USB RFID reader library
- Integrate with camera stream
- Test with actual RFID tags

## 📚 Resource Links

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [JWT Tokens](https://jwt.io/)

## ✅ Verification Checklist

- [ ] Backend .env configured
- [ ] Frontend .env.local configured
- [ ] MongoDB Atlas account created
- [ ] Backend running on :5000
- [ ] Frontend running on :5173
- [ ] Can access http://localhost:5173
- [ ] Can register a farmer account
- [ ] Can register a cow
- [ ] Can see cow in dashboard
- [ ] Vet login works

## 🎉 You're All Set!

Your complete MERN livestock management system is ready to use.

**What's included:**
✅ 25+ backend files
✅ 30+ frontend components
✅ Complete database schema
✅ JWT authentication
✅ Role-based access control
✅ Glassmorphic UI design
✅ Real-time camera integration
✅ Responsive design
✅ Professional documentation

**Start with:**
1. Backend: `npm run dev`
2. Frontend: `npm run dev`
3. Open: `http://localhost:5173`

---

**Need Help?**
- Check backend README: `backend/README.md`
- Check frontend README: `frontend/README.md`
- Check API docs in backend README
- Review error messages in browser console & terminal

**Happy Farming! 🐄** 🌾
