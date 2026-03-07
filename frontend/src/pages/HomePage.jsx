import { Link } from 'react-router-dom';
import { GlassCard, GlassButton } from '../components/Common/GlassUI';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div>
          <h1 className="text-6xl font-bold text-white mb-4">🐄 Livestock Manager</h1>
          <p className="text-2xl text-white/80">AI-Powered Cattle Management System</p>
        </div>

        <GlassCard className="text-white space-y-4">
          <p className="text-lg">
            Welcome to the modern farm management platform. Track your cattle with RFID & AI-powered noseprint biometrics,
            get smart mating recommendations, manage vaccinations, and maintain complete health records.
          </p>
        </GlassCard>

        <GlassCard className="max-w-lg mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">👨‍🌾 Farmer Portal</h2>
          <p className="text-white/70 mb-6">
            Register your cattle with AI noseprint identification, get intelligent mating recommendations based on genetics,
            track health records & vaccinations, and manage your entire herd efficiently.
          </p>
          <div className="space-y-3">
            <Link to="/login" className="block">
              <GlassButton variant="primary" className="w-full text-lg py-4">
                🔐 Login to Dashboard
              </GlassButton>
            </Link>
            <Link to="/register" className="block">
              <GlassButton variant="secondary" className="w-full text-lg py-4">
                📝 Register Your Farm
              </GlassButton>
            </Link>
          </div>
        </GlassCard>

        <GlassCard className="bg-gradient-to-r from-blue-500/20 to-purple-500/20">
          <h3 className="text-xl font-bold text-white mb-4">✨ Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/80 text-left">
            <div>✓ AI Noseprint Recognition</div>
            <div>✓ RFID Tracking</div>
            <div>✓ Mating Compatibility</div>
            <div>✓ Health Records</div>
            <div>✓ Vaccination Calendar</div>
            <div>✓ Family Tree Tracking</div>
            <div>✓ DNA Report Upload</div>
            <div>✓ Breed Information</div>
            <div>✓ Smart Recommendations</div>
          </div>
        </GlassCard>

        <div className="text-white/60 text-sm">
          <p>💡 Demo Account: <span className="font-mono">demo@farmer.com</span> / <span className="font-mono">demo123</span></p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
