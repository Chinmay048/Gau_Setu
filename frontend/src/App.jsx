import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CowProvider } from './context/CowContext';
import { ProtectedRoute, PublicRoute } from './components/Common/ProtectedRoute';
import { Navbar } from './components/Common/Navbar';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterFarmerPage from './pages/RegisterFarmerPage';
import DashboardPage from './pages/DashboardPage';
import RegisterCowPage from './pages/RegisterCowPage';
import CowDetailPage from './pages/CowDetailPage';
import MatingRecommendationsPage from './pages/MatingRecommendationsPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CowProvider>
          <div className="min-h-screen">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />

              {/* Auth Routes - Farmer Only */}
              <Route path="/login" element={<PublicRoute><LoginPage userType="farmer" /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><RegisterFarmerPage /></PublicRoute>} />

              {/* Protected Farmer Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

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

              <Route
                path="/cow/:cowId/mating"
                element={
                  <ProtectedRoute allowedRoles={['farmer']}>
                    <Navbar />
                    <MatingRecommendationsPage />
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
