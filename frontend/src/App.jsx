import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CowProvider } from './context/CowContext';
import { ProtectedRoute, PublicRoute } from './components/Common/ProtectedRoute';
import { Navbar } from './components/Common/Navbar';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterFarmerPage from './pages/RegisterFarmerPage';
import RegisterVetPage from './pages/RegisterVetPage';
import DashboardPage from './pages/DashboardPage';
import RegisterCowPage from './pages/RegisterCowPage';
import CowDetailPage from './pages/CowDetailPage';
import VetSearchCowPage from './pages/VetSearchCowPage';
import VetCreateReportPage from './pages/VetCreateReportPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CowProvider>
          <div className="min-h-screen">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />

              {/* Auth Routes */}
              <Route path="/login-farmer" element={<PublicRoute><LoginPage userType="farmer" /></PublicRoute>} />
              <Route path="/login-vet" element={<PublicRoute><LoginPage userType="vet" /></PublicRoute>} />
              <Route path="/register-farmer" element={<PublicRoute><RegisterFarmerPage /></PublicRoute>} />
              <Route path="/register-vet" element={<PublicRoute><RegisterVetPage /></PublicRoute>} />

              {/* Protected Routes */}
              <Route path="/login" element={<Navigate to="/login-farmer" />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Farmer Routes */}
              <Route
                path="/register-cow"
                element={
                  <ProtectedRoute allowedRoles={['farmer']}>
                    <Navbar />
                    <RegisterCowPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/cow/:cowId"
                element={
                  <ProtectedRoute allowedRoles={['farmer']}>
                    <Navbar />
                    <CowDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Vet Routes */}
              <Route
                path="/vet/search-cow"
                element={
                  <ProtectedRoute allowedRoles={['vet']}>
                    <Navbar />
                    <VetSearchCowPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/vet/create-report/:cowId"
                element={
                  <ProtectedRoute allowedRoles={['vet']}>
                    <Navbar />
                    <VetCreateReportPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </CowProvider>
      </AuthProvider>
    </Router>
  );
}
