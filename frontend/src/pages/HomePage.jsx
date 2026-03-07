import { Link } from 'react-router-dom';
import { GlassCard, GlassButton } from '../components/Common/GlassUI';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div>
          <h1 className="text-6xl font-bold text-white mb-4">🐄 Farmer Dashboard</h1>
          <p className="text-2xl text-white/80">Smart Livestock Management System</p>
        </div>

        <GlassCard className="text-white space-y-4">
          <p className="text-lg">
            Welcome to the modern farm management platform. Track your cattle with RFID, manage vaccinations,
            connect with veterinarians, and maintain complete health records.
          </p>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard>
            <h2 className="text-2xl font-bold text-white mb-4">👨‍🌾 For Farmers</h2>
            <p className="text-white/70 mb-6">
              Register your cattle, track their health, vaccinations, and manage ownership transfers.
            </p>
            <div className="space-y-2">
              <Link to="/login-farmer" className="block">
                <GlassButton variant="primary" className="w-full">
                  Login as Farmer
                </GlassButton>
              </Link>
              <Link to="/register-farmer" className="block">
                <GlassButton variant="secondary" className="w-full">
                  Register Farm
                </GlassButton>
              </Link>
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="text-2xl font-bold text-white mb-4">⚕️ For Veterinarians</h2>
            <p className="text-white/70 mb-6">
              Search cattle by RFID, create health reports, verify vaccinations, and maintain medical records.
            </p>
            <div className="space-y-2">
              <Link to="/login-vet" className="block">
                <GlassButton variant="primary" className="w-full">
                  Login as Vet
                </GlassButton>
              </Link>
              <Link to="/register-vet" className="block">
                <GlassButton variant="secondary" className="w-full">
                  Register Clinic
                </GlassButton>
              </Link>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="bg-gradient-to-r from-blue-500/20 to-purple-500/20">
          <h3 className="text-xl font-bold text-white mb-4">✨ Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80 text-left">
            <div>✓ RFID & Biometric Scanning</div>
            <div>✓ Health Monitoring</div>
            <div>✓ Vaccination Calendar</div>
            <div>✓ Medical Reports</div>
            <div>✓ Ownership Transfer</div>
            <div>✓ Family Tree Tracking</div>
            <div>✓ Breed Detection (AI)</div>
            <div>✓ Real-time Alerts</div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default HomePage;
