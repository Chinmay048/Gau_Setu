import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCow } from '../hooks/useCow';
import { GlassCard, GlassButton, GlassInput, ErrorAlert, SuccessAlert } from '../components/Common/GlassUI';
import { useCamera } from '../hooks/useCamera';

const RegisterCowPage = () => {
  const navigate = useNavigate();
  const { registerCow, loading, error } = useCow();
  
  const [step, setStep] = useState(1);
  const [registrationType, setRegistrationType] = useState('newborn');
  const [formData, setFormData] = useState({
    rfidNumber: '',
    gender: 'female',
    birthDate: '',
    photoUrl: '',
    fatherId: '',
    motherId: '',
  });
  const [success, setSuccess] = useState(false);

  const { videoRef, startCamera, captureFrame, stopCamera, isActive } = useCamera((imageData) => {
    setFormData({ ...formData, photoUrl: imageData });
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerCow(formData, registrationType);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleCapturePhoto = () => {
    captureFrame();
    setTimeout(() => stopCamera(), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-teal-600 to-blue-600 p-8">
      <div className="max-w-2xl mx-auto">
        <GlassCard>
          <h1 className="text-3xl font-bold text-white mb-6">📋 Register New Cow</h1>

          {error && <ErrorAlert message={error} />}
          {success && <SuccessAlert message="Cow registered successfully!" />}

          <div className="mb-8">
            <label className="text-white font-semibold mb-4 block">Registration Type</label>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setRegistrationType('newborn');
                  setStep(1);
                }}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  registrationType === 'newborn'
                    ? 'bg-blue-500/30 border-blue-300'
                    : 'bg-white/10 border-white/20'
                }`}
              >
                <div className="text-2xl mb-2">👶</div>
                <div className="text-white font-semibold">Newborn Calf</div>
              </button>
              <button
                onClick={() => {
                  setRegistrationType('purchased');
                  setStep(1);
                }}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  registrationType === 'purchased'
                    ? 'bg-purple-500/30 border-purple-300'
                    : 'bg-white/10 border-white/20'
                }`}
              >
                <div className="text-2xl mb-2">🤝</div>
                <div className="text-white font-semibold">Purchased</div>
              </button>
            </div>
          </div>

          {/* Step 1: RFID & Gender */}
          {step === 1 && (
            <div className="space-y-4 mb-6">
              <GlassInput
                label="RFID Number"
                placeholder="Enter or scan RFID"
                name="rfidNumber"
                value={formData.rfidNumber}
                onChange={handleChange}
                required
              />
              <div>
                <label className="text-white font-semibold mb-2 block">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full backdrop-blur-sm bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
              <GlassInput
                label="Birth Date"
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                required
              />
              <GlassButton variant="primary" className="w-full" onClick={() => setStep(2)}>
                Next →
              </GlassButton>
            </div>
          )}

          {/* Step 2: Photo & Biometric */}
          {step === 2 && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-white font-semibold mb-2 block">Capture Nose Photo</label>
                {!isActive ? (
                  <GlassButton variant="secondary" className="w-full" onClick={startCamera}>
                    📷 Start Camera
                  </GlassButton>
                ) : (
                  <div className="space-y-2">
                    <video
                      ref={videoRef}
                      autoPlay
                      className="w-full rounded-lg"
                      style={{ maxHeight: '300px' }}
                    />
                    <div className="flex gap-2">
                      <GlassButton variant="success" className="flex-1" onClick={handleCapturePhoto}>
                        Capture
                      </GlassButton>
                      <GlassButton variant="danger" className="flex-1" onClick={stopCamera}>
                        Stop
                      </GlassButton>
                    </div>
                  </div>
                )}
                {formData.photoUrl && (
                  <p className="text-green-300 mt-2">✓ Photo captured</p>
                )}
              </div>
              <div className="flex gap-2">
                <GlassButton variant="secondary" className="flex-1" onClick={() => setStep(1)}>
                  ← Back
                </GlassButton>
                <GlassButton
                  variant="primary"
                  className="flex-1"
                  onClick={() => setStep(registrationType === 'newborn' ? 3 : 4)}
                >
                  Next →
                </GlassButton>
              </div>
            </div>
          )}

          {/* Step 3: Family Tree (Newborn Only) */}
          {step === 3 && registrationType === 'newborn' && (
            <div className="space-y-4 mb-6">
              <GlassInput
                label="Father RFID (optional)"
                placeholder="Enter father RFID"
                name="fatherId"
                value={formData.fatherId}
                onChange={handleChange}
              />
              <GlassInput
                label="Mother RFID (optional)"
                placeholder="Enter mother RFID"
                name="motherId"
                value={formData.motherId}
                onChange={handleChange}
              />
              <div className="flex gap-2">
                <GlassButton variant="secondary" className="flex-1" onClick={() => setStep(2)}>
                  ← Back
                </GlassButton>
                <GlassButton variant="primary" className="flex-1" onClick={() => setStep(4)}>
                  Next →
                </GlassButton>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {step === (registrationType === 'newborn' ? 4 : 3) && (
            <div className="space-y-4">
              <div className="text-white space-y-2">
                <p><span className="font-semibold">RFID:</span> {formData.rfidNumber}</p>
                <p><span className="font-semibold">Gender:</span> {formData.gender}</p>
                <p><span className="font-semibold">Birth Date:</span> {formData.birthDate}</p>
                {registrationType === 'newborn' && (
                  <>
                    <p><span className="font-semibold">Father:</span> {formData.fatherId || 'Not specified'}</p>
                    <p><span className="font-semibold">Mother:</span> {formData.motherId || 'Not specified'}</p>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <GlassButton variant="secondary" className="flex-1" onClick={() => setStep(1)}>
                  Edit
                </GlassButton>
                <GlassButton
                  variant="primary"
                  className="flex-1"
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading ? 'Registering...' : 'Confirm & Register'}
                </GlassButton>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default RegisterCowPage;
