import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cowAPI } from '../services/apiService';
import { GlassCard, GlassButton, LoadingSpinner, ErrorAlert } from '../components/Common/GlassUI';

export const MatingRecommendationsPage = () => {
  const { cowId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    loadRecommendations();
  }, [cowId]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const response = await cowAPI.getMatingRecommendations(cowId);
      console.log('✅ Mating recommendations:', response.data);
      setData(response.data);
    } catch (err) {
      console.error('❌ Failed to load recommendations:', err);
      setError(err.response?.data?.error || 'Failed to load mating recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreBadge = (score) => {
    if (score >= 85) return 'bg-green-500/20 text-green-300 border-green-400';
    if (score >= 70) return 'bg-yellow-500/20 text-yellow-300 border-yellow-400';
    return 'bg-orange-500/20 text-orange-300 border-orange-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20 px-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <ErrorAlert message={error} onClose={() => setError('')} />
          <GlassButton onClick={() => navigate('/dashboard')} className="mt-4">
            Back to Dashboard
          </GlassButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="text-white/70 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">
            🐮 Mating Recommendations
          </h1>
          <p className="text-white/70 text-lg">
            Top compatible bulls for {data?.cow?.rfid_number}
          </p>
        </div>

        {/* Cow Info Card */}
        <GlassCard className="mb-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-3xl">
              🐄
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">Your Cow</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white/80">
                <div>
                  <p className="text-white/60 text-sm">RFID Number</p>
                  <p className="font-semibold">{data?.cow?.rfid_number}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Breed</p>
                  <p className="font-semibold">{data?.cow?.breed || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Birth Date</p>
                  <p className="font-semibold">{new Date(data?.cow?.birth_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Location</p>
                  <p className="font-semibold">{data?.cow?.location || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Recommendations */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Top {data?.recommendations?.length || 0} Compatible Bulls</h2>
          
          {data?.recommendations?.length === 0 ? (
            <GlassCard>
              <p className="text-white/70 text-center py-8">
                No compatible bulls found. Try registering more cattle or check back later.
              </p>
            </GlassCard>
          ) : (
            data?.recommendations?.map((bull, index) => (
              <GlassCard key={bull.bull_id} className="hover:bg-white/15 transition-all duration-300">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                      'bg-gradient-to-br from-orange-400 to-orange-600'
                    }`}>
                      #{index + 1}
                    </div>
                  </div>

                  {/* Bull Details */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                          Bull {bull.rfid_number}
                        </h3>
                        <p className="text-white/60">
                          {bull.breed} • Born: {new Date(bull.birth_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`px-6 py-3 rounded-full border-2 ${getScoreBadge(bull.compatibility_score)} font-bold text-lg`}>
                        {bull.compatibility_score}% Match
                      </div>
                    </div>

                    {/* Farmer Info */}
                    <div className="bg-white/5 rounded-lg p-4 mb-4">
                      <p className="text-white/60 text-sm mb-2">Owner Details</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-white">
                        <div>
                          <span className="text-white/60">Farm:</span> {bull.farm_name}
                        </div>
                        <div>
                          <span className="text-white/60">Location:</span> {bull.location}
                        </div>
                        <div>
                          <span className="text-white/60">Contact:</span> {bull.phone_number || bull.email}
                        </div>
                      </div>
                    </div>

                    {/* Compatibility Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-white/60 text-sm mb-1">Genetic Diversity</p>
                        <p className={`text-2xl font-bold ${getScoreColor(bull.genetic_diversity_score)}`}>
                          {bull.genetic_diversity_score}%
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-white/60 text-sm mb-1">Health Compatibility</p>
                        <p className={`text-2xl font-bold ${getScoreColor(bull.health_compatibility_score)}`}>
                          {bull.health_compatibility_score}%
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-white/60 text-sm mb-1">Breed Match</p>
                        <p className="text-2xl font-bold">
                          {bull.breed_match ? '✅ Yes' : '⚠️ No'}
                        </p>
                      </div>
                    </div>

                    {/* Health Status */}
                    <div className="bg-white/5 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🏥</span>
                        <div className="flex-1">
                          <p className="text-white font-semibold mb-1">Health Information</p>
                          <p className="text-white/70">
                            {bull.health_issues === 'None reported' ? (
                              <span className="text-green-400">✓ No health issues reported</span>
                            ) : (
                              <span className="text-yellow-400">⚠️ {bull.health_issues}</span>
                            )}
                          </p>
                          <p className="text-white/60 text-sm mt-2">
                            Vaccinations: {bull.vaccination_status?.up_to_date}/{bull.vaccination_status?.total} up to date 
                            {bull.vaccination_status?.is_compliant && ' ✓'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {bull.notes && (
                      <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3">
                        <p className="text-blue-300 text-sm">
                          <span className="font-semibold">Note:</span> {bull.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <GlassButton onClick={() => navigate('/dashboard')} variant="secondary">
            Back to Dashboard
          </GlassButton>
          <GlassButton onClick={() => navigate(`/cow/${cowId}`)} variant="primary">
            View Cow Details
          </GlassButton>
        </div>
      </div>
    </div>
  );
};

export default MatingRecommendationsPage;
