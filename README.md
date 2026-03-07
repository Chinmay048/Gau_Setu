# 🐄 Farmer Dashboard - Complete MERN Stack Application

Professional livestock management system with RFID tracking, veterinary integration, and health monitoring.

## 📚 Documentation

- **Backend**: See [backend/README.md](./backend/README.md)
- **Frontend**: See [frontend/README.md](./frontend/README.md)

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB Atlas account
- Two terminal windows

### Step 1: Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm install
npm run dev
```

### Step 2: Frontend Setup

```bash
# In a new terminal
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### Step 3: Access Application

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- API: `http://localhost:5000/api`

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│           FRONTEND (React + Vite)                   │
│    (Glassmorphism UI + Camera Integration)          │
└────────────────────┬────────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────┐
│      BACKEND (Express + MongoDB)                    │
│  (JWT Auth + Role-Based Access Control)             │
└────────────────────┬────────────────────────────────┘
                     │ Database
                     ▼
         ┌───────────────────────┐
         │   MongoDB Atlas       │
         │  (Cloud Database)     │
         └───────────────────────┘
```

## 🎯 Phase 1 Features

### For Farmers
✅ User registration & login with farm details
✅ Newborn calf registration with RFID + biometric
✅ Purchased cow registration
✅ Real-time camera-based biometric capture
✅ Automatic age calculation from birth date
✅ Family tree tracking (father/mother RFID)
✅ Vaccination calendar with real-time alerts
✅ DNA status tracking and report upload
✅ Ownership transfer between farms
✅ Cow detail page with medical history

### For Veterinarians
✅ User registration (pending admin approval)
✅ License verification
✅ Search cow by RFID or ID
✅ Create health/disease reports
✅ Add prescription details
✅ Upload medical attachments
✅ Verify vaccinations
✅ View all submitted reports

### Core Infrastructure
✅ No hardcoded values - all from environment variables
✅ JWT-based authentication
✅ Role-based access control (Farmer/Vet)
✅ Complete database schema with relationships
✅ Error handling & validation
✅ CORS configuration

## 📊 Database Models

- **Farmer**: Farm profiles with location & contact
- **Vet**: Veterinarian profiles with license verification  
- **Cow**: Livestock records with health tracking
- **Biometric**: Nose-scan templates for identification
- **Vaccination**: Vaccine records with verification status
- **VetReport**: Health check-ups and disease diagnoses
- **OwnershipTransfer**: Cow transfers between farms

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Role-based access control
- CORS protection
- Request validation
- Error handling with secure messages

## 🎨 UI/UX Design

- **Glassmorphism**: Frosted glass aesthetic with backdrop blur
- **Responsive**: Mobile, tablet, desktop support
- **Color Schemes**: 
  - Farmer Dashboard: Blue → Purple → Pink
  - Vet Dashboard: Red → Orange → Yellow
  - Auth Pages: Gradient backgrounds
- **Animations**: Smooth transitions, hover effects
- **Accessibility**: Semantic HTML, clear contrast

## 📱 Browser Compatibility

- ✅ Chrome/Edge (v90+)
- ✅ Firefox (v88+)
- ✅ Safari (v14+)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🔌 API Overview

### Authentication (3 endpoints)
```
POST /api/auth/farmer/register
POST /api/auth/farmer/login
POST /api/auth/vet/register
POST /api/auth/vet/login
```

### Cows (5 endpoints)
```
POST /api/cows/register/newborn
POST /api/cows/register/purchased
GET /api/cows/my-cows
GET /api/cows/:cowId
PUT /api/cows/:cowId/dna-status
```

### Vaccinations (4 endpoints)
```
POST /api/vaccinations
GET /api/vaccinations/:cowId/history
GET /api/vaccinations/:cowId/upcoming
PUT /api/vaccinations/:id/verify
```

### Veterinarian (5 endpoints)
```
GET /api/vet/cow/search/:cowId
POST /api/vet/report/create
PUT /api/vet/report/:id/submit
GET /api/vet/report/cow/:cowId
GET /api/vet/reports/my-submissions
```

### Transfers (3 endpoints)
```
POST /api/transfers/initiate
PUT /api/transfers/:id/complete
GET /api/transfers/pending
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT, bcryptjs
- **Validation**: Joi
- **Utilities**: Axios, Morgan, CORS

### Frontend
- **UI Library**: React 18
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API

## 📝 Environment Configuration

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/farmers_db
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BREED_MODEL_ENDPOINT=http://localhost:5001/predict
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚦 Project Status

**Phase 1**: ✅ Complete
- Farmer dashboard
- Vet integration  
- Cow registration
- Vaccination tracking
- Health reports
- Ownership transfer

**Upcoming Phases**:
- Admin dashboard
- Mobile app
- Advanced analytics
- AI breed detection
- SMS/Email notifications
- Real RFID hardware integration

## 📞 Support & Documentation

Detailed documentation available in:
- `backend/README.md` - Backend setup & API docs
- `frontend/README.md` - Frontend setup & component guide

## 📄 License

This project is part of the Farmer Dashboard initiative.

---

**Built with ❤️ for sustainable livestock management**
