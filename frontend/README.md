# 🐄 Farmer Dashboard - Frontend

Beautiful glassmorphic React dashboard for livestock management.

## ✨ Features

- **Responsive UI**: Works on desktop, tablet, and mobile
- **Glassmorphism Design**: Modern frosted glass aesthetic with Tailwind CSS
- **Real-time Camera**: RFID scanning and biometric capture
- **Multi-step Forms**: Intuitive cow registration workflow
- **Context API**: Global state management for auth and cow data
- **Protected Routes**: Role-based access control (Farmer/Vet)
- **API Integration**: Axios with automatic JWT token handling

## 📋 Prerequisites

- Node.js v16+
- npm or yarn
- Backend running on `http://localhost:5000`

## 🚀 Installation

### 1. Setup Environment Variables

```bash
cp .env.example .env.local
```

Update `.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Common/
│   │       ├── GlassUI.jsx      # Reusable glassmorphic components
│   │       ├── ProtectedRoute.jsx
│   │       └── Navbar.jsx
│   ├── context/
│   │   ├── AuthContext.jsx      # Authentication state
│   │   └── CowContext.jsx       # Cow data state
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useCow.js
│   │   ├── useCamera.js         # Camera/biometric capture
│   │   └── useRFIDScanner.js
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterFarmerPage.jsx
│   │   ├── RegisterVetPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── RegisterCowPage.jsx
│   │   ├── CowDetailPage.jsx
│   │   ├── VetSearchCowPage.jsx
│   │   └── VetCreateReportPage.jsx
│   ├── services/
│   │   └── apiService.js        # API calls with Axios
│   ├── utils/
│   │   └── helpers.js           # Date, validation helpers
│   ├── App.jsx                  # Routing
│   ├── main.jsx                 # React root
│   └── index.css                # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🎨 Glassmorphism UI Components

Reusable components in `src/components/Common/GlassUI.jsx`:

- **GlassCard**: Frosted glass container
- **GlassButton**: Interactive buttons (primary/secondary/danger/success)
- **GlassInput**: Form inputs with labels
- **LoadingSpinner**: Animated loading indicator
- **ErrorAlert**: Error message display
- **SuccessAlert**: Success message display

## 🔐 Authentication Flow

1. User enters credentials
2. API call to `/api/auth/[farmer|vet]/login`
3. Backend returns JWT token
4. Token stored in localStorage
5. Token automatically added to all API requests
6. User redirected to dashboard

## 📱 Pages

### Public Pages
- **HomePage**: Feature overview with login options
- **LoginPage**: Farmer or Vet login
- **RegisterFarmerPage**: Farm registration
- **RegisterVetPage**: Veterinarian registration

### Farmer Pages (Protected)
- **DashboardPage**: List all cows with quick stats
- **RegisterCowPage**: Multi-step cow registration
  - Step 1: RFID & Gender
  - Step 2: Biometric capture
  - Step 3: Family tree (if newborn)
  - Step 4: Review & submit
- **CowDetailPage**: Full cow profile with vaccination history

### Vet Pages (Protected)
- **VetSearchCowPage**: Search cow by RFID/ID
- **VetCreateReportPage**: Create health/disease report

## 🎥 Camera Integration

`useCamera` hook provides:

```javascript
const { videoRef, startCamera, captureFrame, stopCamera, isActive } = useCamera(onCapture);

// Usage:
// 1. User clicks "Start Camera"
// 2. Video stream shown in video element
// 3. User captures frame
// 4. Image sent to onCapture callback
// 5. Camera stopped
```

## 🔌 API Service

`src/services/apiService.js` includes:

```javascript
// Auth
authAPI.farmerRegister(data)
authAPI.farmerLogin(data)
authAPI.vetRegister(data)
authAPI.vetLogin(data)

// Cows
cowAPI.registerNewborn(data)
cowAPI.registerPurchased(data)
cowAPI.getMyCows()
cowAPI.getCowDetail(cowId)
cowAPI.updateCowDNA(cowId, data)

// Vaccinations
vaccinationAPI.addVaccination(data)
vaccinationAPI.getHistory(cowId)
vaccinationAPI.verifyVaccination(vaccinationId)

// Vet
vetAPI.searchCow(cowId)
vetAPI.createReport(data)
vetAPI.submitReport(reportId, data)

// Transfers
transferAPI.initiateTransfer(data)
transferAPI.completeTransfer(transferId)
transferAPI.getPendingTransfers()
```

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Gradient Backgrounds**: Dynamic color schemes per page
- **Backdrop Blur**: Glassmorphism effects with `backdrop-blur-md`
- **Custom Colors**: White with transparency for glass effect

## 🌍 Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_URL` | Backend API endpoint | `http://localhost:5000/api` |

## 📝 Important Notes

- JWT tokens stored in localStorage
- No sensitive data in localStorage
- All API requests include authorization header
- Protected routes redirect to login if not authenticated
- Role-based access prevents unauthorized page access

## 🐛 Troubleshooting

**Cannot connect to backend:**
- Ensure backend is running on port 5000
- Check VITE_API_URL in .env.local
- Verify CORS settings on backend

**Login fails:**
- Confirm credentials are correct
- Check backend is responding to POST /api/auth/farmer/login
- Look for error message in browser console

**Camera not working:**
- Ensure HTTPS in production (required for camera access)
- Check browser camera permissions
- Some browsers require user interaction to start camera

**State not persisting after refresh:**
- Token is stored in localStorage
- User context is lost (re-login required)
- Implement SessionStorage for persistence if needed

## 🚀 Performance Tips

- Code splitting via React Router
- Lazy loading of routes
- Image optimization in cow photos
- Minimal re-renders with useCallback/useMemo

## 📞 Support

For issues or questions, check browser console for errors.
