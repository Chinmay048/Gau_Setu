import { useState } from 'react';
import { vetAPI } from '../services/apiService';
import { GlassCard, GlassButton, GlassInput, ErrorAlert, LoadingSpinner } from '../components/Common/GlassUI';

const VetSearchCowPage = () => {
  const [searchId, setSearchId] = useState('');
  const [cow, setCow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchId) {
      setError('Please enter a Cow ID');
      return;
    }

    setLoading(true);
    setError('');
    setCow(null);

    try {
      const response = await vetAPI.searchCow(searchId);
      setCow(response.data.cow);
    } catch (err) {
      setError(err.response?.data?.error || 'Cow not found');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = () => {
    // Navigate to create report with cow data
    window.location.href = `/vet/create-report/${cow._id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600 p-8">
      <div className="max-w-2xl mx-auto">
        <GlassCard>
          <h1 className="text-3xl font-bold text-white mb-6">🔍 Search Cow</h1>

          <div className="space-y-4 mb-6">
            <GlassInput
              label="Cow ID or RFID"
              placeholder="Enter cow RFID number"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
            <GlassButton
              variant="primary"
              className="w-full"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </GlassButton>
          </div>

          {error && <ErrorAlert message={error} />}

          {loading && <LoadingSpinner />}

          {cow && (
            <div className="space-y-6">
              <GlassCard className="bg-white/5">
                <h2 className="text-2xl font-bold text-white mb-4">Cow Information</h2>
                <div className="grid grid-cols-2 gap-4 text-white/80">
                  <div>
                    <p className="text-white/50 text-sm">RFID</p>
                    <p className="font-semibold">{cow.rfidNumber}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm">Gender</p>
                    <p className="font-semibold capitalize">{cow.gender}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm">Breed</p>
                    <p className="font-semibold">{cow.breedDetected?.breed || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm">Status</p>
                    <p className="font-semibold capitalize">{cow.healthStatus}</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="text-white/70 mb-2">
                    <span className="font-semibold">Farmer:</span> {cow.farmerId?.farmName || 'N/A'}
                  </p>
                  <p className="text-white/70">
                    <span className="font-semibold">Phone:</span> {cow.farmerId?.phoneNumber || 'N/A'}
                  </p>
                </div>
              </GlassCard>

              <GlassButton
                variant="primary"
                className="w-full"
                onClick={handleCreateReport}
              >
                📋 Create Health Report
              </GlassButton>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default VetSearchCowPage;
