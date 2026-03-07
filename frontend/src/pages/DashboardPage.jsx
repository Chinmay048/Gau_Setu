import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCow } from '../hooks/useCow';
import { useAuth } from '../hooks/useAuth';
import { GlassCard, GlassButton, LoadingSpinner } from '../components/Common/GlassUI';
import { formatAge, formatDate, calculateAge } from '../utils/helpers';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cows, loading, fetchMyCows } = useCow();

  useEffect(() => {
    if (user?.type === 'farmer') {
      fetchMyCows();
    }
  }, [user, fetchMyCows]);

  const handleRegisterCow = () => {
    navigate('/register-cow');
  };

  const handleCowDetail = (cowId) => {
    navigate(`/cow/${cowId}`);
  };

  if (user?.type === 'vet') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 p-8">
        <div className="max-w-7xl mx-auto">
          <GlassCard className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">⚕️ Veterinarian Dashboard</h1>
            <p className="text-white/70">Welcome, {user.name}</p>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="cursor-pointer hover:shadow-2xl transition-all">
              <Link to="/vet/search-cow">
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🔍</div>
                  <h2 className="text-2xl font-bold text-white">Search Cow</h2>
                  <p className="text-white/70 mt-2">Look up cow by RFID or ID</p>
                </div>
              </Link>
            </GlassCard>

            <GlassCard className="cursor-pointer hover:shadow-2xl transition-all">
              <Link to="/vet/my-reports">
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">📋</div>
                  <h2 className="text-2xl font-bold text-white">My Reports</h2>
                  <p className="text-white/70 mt-2">View your health reports</p>
                </div>
              </Link>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8">
      <div className="max-w-7xl mx-auto">
        <GlassCard className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">🐄 Farm Dashboard</h1>
              <p className="text-white/70">Welcome to {user?.farmName || 'your farm'}</p>
            </div>
            <GlassButton variant="primary" onClick={handleRegisterCow}>
              + Register New Cow
            </GlassButton>
          </div>
        </GlassCard>

        {loading ? (
          <LoadingSpinner />
        ) : cows.length === 0 ? (
          <GlassCard className="text-center py-12">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-white/70 mb-6">No cows registered yet</p>
            <GlassButton variant="primary" onClick={handleRegisterCow}>
              Register Your First Cow
            </GlassButton>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cows.map((cow) => (
              <GlassCard key={cow._id} className="cursor-pointer hover:shadow-2xl transition-all hover:scale-105"
                onClick={() => handleCowDetail(cow._id)}>
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white">#{cow.rfidNumber}</h3>
                  <p className="text-white/70">{cow.breedDetected?.breed || 'Breed: Unknown'}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-white/80">
                    <span className="font-semibold">Gender:</span> {cow.gender}
                  </p>
                  <p className="text-white/80">
                    <span className="font-semibold">Age:</span> {formatAge(calculateAge(cow.birthDate))}
                  </p>
                  <p className="text-white/80">
                    <span className="font-semibold">Born:</span> {formatDate(cow.birthDate)}
                  </p>
                  <p className="text-white/80">
                    <span className="font-semibold">Status:</span>{' '}
                    <span className={`px-2 py-1 rounded ${
                      cow.healthStatus === 'healthy' ? 'bg-green-500/30 text-green-200' : 'bg-red-500/30 text-red-200'
                    }`}>
                      {cow.healthStatus}
                    </span>
                  </p>
                </div>

                <GlassButton variant="secondary" className="w-full mt-4">
                  View Details →
                </GlassButton>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
