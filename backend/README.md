# 🐄 Farmer Dashboard - Backend

Professional livestock management system backend with MERN stack.

## ✨ Features

- **Farmer Management**: User registration, login, farm profiles
- **Veterinarian System**: Vet registration with license verification
- **Cow Registration**: Newborn calves or purchased cattle
- **Biometric Scanning**: Nose-scan template storage for cows
- **Vaccination Tracking**: Complete vaccination history and calendar
- **Health Reports**: Veterinarian disease diagnosis and treatment records
- **Ownership Transfer**: Seamless cow transfer between farms
- **Family Tree**: Genetic tracking through father/mother relationships

## 📋 Prerequisites

- Node.js v16+ 
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

## 🚀 Installation

### 1. Setup Environment Variables

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/farmers_db

# JWT
JWT_SECRET=your_very_secure_secret_key_here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# ML Model (optional)
BREED_MODEL_ENDPOINT=http://localhost:5001/predict
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── config/           # DB connection, constants
├── models/          # MongoDB schemas
│   ├── Farmer.js
│   ├── Vet.js
│   ├── Cow.js
│   ├── Biometric.js
│   ├── Vaccination.js
│   ├── VetReport.js
│   └── OwnershipTransfer.js
├── controllers/     # Business logic
├── routes/         # API endpoints
├── middleware/     # Auth, validation, error handling
├── services/       # Database operations
├── utils/         # Helpers
├── server.js      # App entry point
└── package.json
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/farmer/register     # Register farmer
POST   /api/auth/farmer/login        # Farmer login
POST   /api/auth/vet/register        # Register vet (pending approval)
POST   /api/auth/vet/login           # Vet login
```

### Cow Management
```
POST   /api/cows/register/newborn    # Register newborn calf
POST   /api/cows/register/purchased  # Register purchased cow
GET    /api/cows/my-cows             # Get all farmer's cows
GET    /api/cows/:cowId              # Get cow details
PUT    /api/cows/:cowId/dna-status   # Update DNA status
```

### Vaccinations
```
POST   /api/vaccinations             # Add vaccination (vet only)
GET    /api/vaccinations/:cowId/history          # Get history
GET    /api/vaccinations/:cowId/upcoming         # Get upcoming
PUT    /api/vaccinations/:id/verify  # Verify vaccine (vet)
```

### Veterinarian
```
GET    /api/vet/cow/search/:cowId    # Search cow (vet only)
POST   /api/vet/report/create        # Create health report
PUT    /api/vet/report/:id/submit    # Submit report
GET    /api/vet/reports/my-submissions  # Get vet's reports
```

### Ownership Transfer
```
POST   /api/transfers/initiate       # Start transfer
PUT    /api/transfers/:id/complete   # Complete transfer
GET    /api/transfers/pending        # Get pending transfers
```

## 🔐 Authentication

The system uses JWT tokens for authentication:

1. User registers → receives JWT token  
2. Token stored in localStorage  
3. Token sent in `Authorization: Bearer <token>` header
4. Token expires after 7 days (configurable)

## 🗄️ Database Schema

### Farmer
```javascript
{
  email, password, farmName, phoneNumber, location,
  address, latitude, longitude, role, profileImage,
  verified, createdAt, updatedAt
}
```

### Vet
```javascript
{
  email, password, name, clinicName, licenseNumber,
  phoneNumber, address, specializations, role, verified,
  status (pending/approved/rejected), createdAt
}
```

### Cow
```javascript
{
  rfidNumber, farmerId, biometricId, gender, birthDate,
  age, breedDetected, registrationType, fatherId, motherId,
  dnaStatus, photoUrl, healthStatus, createdAt
}
```

## 🔧 Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | Database connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing tokens | Any long random string |
| `JWT_EXPIRE` | Token expiration time | `7d`, `24h` |
| `PORT` | Server port | `5000` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:5173` |
| `BREED_MODEL_ENDPOINT` | AI model URL | `http://localhost:5001/predict` |

## 📝 Notes

- All passwords are hashed using bcryptjs
- RFID numbers must be unique
- No data is hardcoded - everything uses environment variables
- Vet application requires admin approval before use
- Timestamps automatically tracked for all entities

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Verify MONGODB_URI is correct
- Ensure IP is whitelisted in MongoDB Atlas
- Check firewall settings

**JWT Token Errors:**
- Verify JWT_SECRET is set
- Check token format: `Bearer <token>`
- Confirm token hasn't expired

**CORS Issues:**
- Verify FRONTEND_URL matches actual frontend domain
- Check browser console for specific errors

## 📞 Support

For issues or questions, refer to the API documentation or create an issue.
