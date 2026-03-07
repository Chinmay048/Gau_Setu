import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCow } from '../hooks/useCow';
import { vaccinationAPI } from '../services/apiService';
import { GlassCard, GlassButton, LoadingSpinner } from '../components/Common/GlassUI';
import { formatAge, formatDate, calculateAge } from '../utils/helpers';

const CowDetailPage = () => {
  const { cowId } = useParams();
  const { currentCow, loading, getCowDetail } = useCow();
  const [vaccinations, setVaccinations] = useState([]);
  const [loadingVaccinations, setLoadingVaccinations] = useState(true);

  useEffect(() => {
    getCowDetail(cowId);
    loadVaccinations();
  }, [cowId]);

  const loadVaccinations = async () => {
    try {
      const response = await vaccinationAPI.getHistory(cowId);
      setVaccinations(response.data.vaccinations);
    } catch (error) {
      console.error('Failed to load vaccinations:', error);
    } finally {
      setLoadingVaccinations(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Cow Info */}
        <GlassCard>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-white/70 text-sm">RFID</p>
              <p className="text-white font-bold text-lg">{currentCow?.rfidNumber}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Breed</p>
              <p className="text-white font-bold">{currentCow?.breedDetected?.breed || 'N/A'}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Age</p>
              <p className="text-white font-bold">{formatAge(calculateAge(currentCow?.birthDate))}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Gender</p>
              <p className="text-white font-bold capitalize">{currentCow?.gender}</p>
            </div>
          </div>

          <div className="space-y-2 text-white/80">
            <p><span className="font-semibold">Born:</span> {formatDate(currentCow?.birthDate)}</p>
            <p><span className="font-semibold">DNA Status:</span> {currentCow?.dnaStatus}</p>
            <p><span className="font-semibold">Health Status:</span> {currentCow?.healthStatus}</p>
          </div>
        </GlassCard>

        {/* Vaccination History */}
        <GlassCard>
          <h2 className="text-2xl font-bold text-white mb-4">💉 Vaccination History</h2>
          {loadingVaccinations ? (
            <LoadingSpinner />
          ) : vaccinations.length === 0 ? (
            <p className="text-white/70">No vaccination records yet</p>
          ) : (
            <div className="space-y-3">
              {vaccinations.map((vac) => (
                <div key={vac._id} className="bg-white/10 rounded-lg p-4">
                  <p className="text-white font-semibold">{vac.vaccineName}</p>
                  <p className="text-white/70 text-sm">
                    {formatDate(vac.vaccineDate)} - Next: {formatDate(vac.nextDueDate)}
                  </p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded text-sm ${
                    vac.status === 'verified' ? 'bg-green-500/30 text-green-200' : 'bg-yellow-500/30 text-yellow-200'
                  }`}>
                    {vac.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Family Tree */}
        {currentCow?.fatherId || currentCow?.motherId ? (
          <GlassCard>
            <h2 className="text-2xl font-bold text-white mb-4">👨‍👩‍👧 Family Tree</h2>
            <div className="space-y-2">
              {currentCow?.fatherId && (
                <p className="text-white">
                  <span className="font-semibold">Father:</span> {currentCow.fatherId.rfidNumber}
                </p>
              )}
              {currentCow?.motherId && (
                <p className="text-white">
                  <span className="font-semibold">Mother:</span> {currentCow.motherId.rfidNumber}
                </p>
              )}
            </div>
          </GlassCard>
        ) : null}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <GlassButton variant="secondary" className="flex-1" onClick={() => window.history.back()}>
            ← Go Back
          </GlassButton>
          <GlassButton variant="primary" className="flex-1">
            🔄 Transfer Ownership
          </GlassButton>
        </div>
      </div>
    </div>
  );
};

export default CowDetailPage;
