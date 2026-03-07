import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vetAPI } from '../services/apiService';
import { GlassCard, GlassButton, GlassInput, ErrorAlert, SuccessAlert } from '../components/Common/GlassUI';

const VetCreateReportPage = () => {
  const { cowId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [reportData, setReportData] = useState({
    reportType: 'health_checkup',
    temperature: '',
    heartRate: '',
    respirationRate: '',
    weight: '',
    symptoms: [],
    diagnosis: '',
    treatment: '',
    severity: 'mild',
  });

  const handleChange = (e) => {
    setReportData({ ...reportData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await vetAPI.createReport({
        cowId,
        ...reportData,
      });

      setSuccess('Health report created successfully!');
      setTimeout(() => navigate('/vet/my-reports'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600 p-8">
      <div className="max-w-2xl mx-auto">
        <GlassCard>
          <h1 className="text-3xl font-bold text-white mb-6">📋 Create Health Report</h1>

          {error && <ErrorAlert message={error} onClose={() => setError('')} />}
          {success && <SuccessAlert message={success} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Report Type */}
            <div>
              <label className="text-white font-semibold mb-2 block">Report Type</label>
              <select
                name="reportType"
                value={reportData.reportType}
                onChange={handleChange}
                className="w-full backdrop-blur-sm bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white"
              >
                <option value="health_checkup">General Health Checkup</option>
                <option value="disease_diagnosis">Disease Diagnosis</option>
                <option value="post_treatment">Post-Treatment Followup</option>
              </select>
            </div>

            {/* Vital Signs */}
            <div className="grid grid-cols-2 gap-4">
              <GlassInput
                label="Temperature (°C)"
                type="number"
                name="temperature"
                placeholder="38.5"
                value={reportData.temperature}
                onChange={handleChange}
                step="0.1"
              />
              <GlassInput
                label="Heart Rate (bpm)"
                type="number"
                name="heartRate"
                placeholder="80"
                value={reportData.heartRate}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <GlassInput
                label="Respiration Rate (/min)"
                type="number"
                name="respirationRate"
                placeholder="28"
                value={reportData.respirationRate}
                onChange={handleChange}
              />
              <GlassInput
                label="Weight (kg)"
                type="number"
                name="weight"
                placeholder="450"
                value={reportData.weight}
                onChange={handleChange}
              />
            </div>

            {/* Diagnosis */}
            <div>
              <label className="text-white font-semibold mb-2 block">Diagnosis</label>
              <textarea
                name="diagnosis"
                placeholder="Enter diagnosis..."
                value={reportData.diagnosis}
                onChange={handleChange}
                className="w-full backdrop-blur-sm bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/50 h-20"
                required
              />
            </div>

            {/* Treatment */}
            <div>
              <label className="text-white font-semibold mb-2 block">Treatment Plan</label>
              <textarea
                name="treatment"
                placeholder="Enter treatment plan..."
                value={reportData.treatment}
                onChange={handleChange}
                className="w-full backdrop-blur-sm bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/50 h-20"
                required
              />
            </div>

            {/* Severity */}
            <div>
              <label className="text-white font-semibold mb-2 block">Severity Level</label>
              <select
                name="severity"
                value={reportData.severity}
                onChange={handleChange}
                className="w-full backdrop-blur-sm bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>

            {/* Submit */}
            <div className="flex gap-2">
              <GlassButton
                variant="secondary"
                className="flex-1"
                type="button"
                onClick={() => navigate(-1)}
              >
                Cancel
              </GlassButton>
              <GlassButton
                variant="primary"
                className="flex-1"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default VetCreateReportPage;
