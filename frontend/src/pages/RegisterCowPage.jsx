import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCow } from '../hooks/useCow';
import { GlassCard, GlassButton, GlassInput, ErrorAlert, SuccessAlert } from '../components/Common/GlassUI';

const RegisterCowPage = () => {
  const navigate = useNavigate();
  const { registerCow, loading, error } = useCow();
  
  const [step, setStep] = useState(1);
  const [registrationType, setRegistrationType] = useState('newborn');
  const [formData, setFormData] = useState({
    rfidNumber: '',
    gender: 'female',
    birthDate: '',
    fatherId: '',
    motherId: '',
  });
  const [noseImages, setNoseImages] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [success, setSuccess] = useState(false);

  // Convert image file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle nose image upload
  const handleNoseImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB');
      return;
    }

    try {
      const base64Image = await convertToBase64(file);
      
      if (noseImages.length < 5) {
        setNoseImages([...noseImages, base64Image]);
        setUploadError('');
      } else {
        setUploadError('Maximum 5 images allowed');
      }
    } catch (err) {
      setUploadError('Failed to upload image');
    }
  };

  // Remove nose image
  const removeNoseImage = (index) => {
    setNoseImages(noseImages.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Nose images are now OPTIONAL - can add later
    if (noseImages.length > 0 && noseImages.length < 3) {
      setUploadError('If uploading nose images, minimum 3 are required. Or skip and add later.');
      return;
    }

    try {
      await registerCow({ ...formData, noseImages }, registrationType);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error('Registration failed:', err);
    }
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

          {/* Step 2: Nose Photos Upload */}
          {step === 2 && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-white font-semibold mb-2 block">
                  📸 Upload Nose Photos (Optional - Can Add Later)
                </label>
                <p className="text-white/70 text-sm mb-4">
                  For biometric identification, upload at least 3 clear photos of the cow's nose. You can skip this step and add photos later from the cow's profile.
                </p>

                {/* Upload Button */}
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleNoseImageUpload}
                    className="hidden"
                    disabled={noseImages.length >= 5}
                  />
                  <div
                    className={`w-full backdrop-blur-sm bg-white/10 border-2 border-dashed border-white/30 rounded-lg p-8 text-center cursor-pointer hover:bg-white/20 transition-all ${
                      noseImages.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-white font-semibold">
                      {noseImages.length < 5 ? 'Click to Upload Nose Photo' : 'Maximum 5 images uploaded'}
                    </p>
                    <p className="text-white/70 text-sm mt-1">
                      Uploaded: {noseImages.length}/5 {noseImages.length >= 3 ? '✓ Ready' : noseImages.length > 0 ? '(need ' + (3 - noseImages.length) + ' more)' : '(optional)'}
                    </p>
                  </div>
                </label>

                {uploadError && (
                  <div className="mt-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                    {uploadError}
                  </div>
                )}

                {/* Image Previews */}
                {noseImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-white font-semibold mb-2">Uploaded Images:</p>
                    <div className="grid grid-cols-3 gap-3">
                      {noseImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Nose ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-white/30"
                          />
                          <div className="absolute top-1 right-1">
                            <button
                              onClick={() => removeNoseImage(index)}
                              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                            >
                              ×
                            </button>
                          </div>
                          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            Sample {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {noseImages.length >= 3 && (
                  <div className="mt-3 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200">
                    ✓ Sufficient nose samples uploaded! Ready to create unique biometric ID.
                  </div>
                )}

                {noseImages.length === 0 && (
                  <div className="mt-3 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-200">
                    💡 No nose images? You can add them later from the cow's profile page.
                  </div>
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
                  {noseImages.length >= 3 ? 'Next →' : 'Skip Biometric →'}
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
                <p>
                  <span className="font-semibold">Biometric:</span> {' '}
                  {noseImages.length >= 3 ? (
                    <span className="text-green-400">{noseImages.length} nose images uploaded ✓</span>
                  ) : (
                    <span className="text-yellow-400">Will be added later</span>
                  )}
                </p>
                {registrationType === 'newborn' && (
                  <>
                    <p><span className="font-semibold">Father:</span> {formData.fatherId || 'Not specified'}</p>
                    <p><span className="font-semibold">Mother:</span> {formData.motherId || 'Not specified'}</p>
                  </>
                )}
              </div>
              
              {noseImages.length >= 3 ? (
                <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-200">
                  <p className="font-semibold mb-1">🔐 Biometric Registration</p>
                  <p className="text-sm">A unique noseprint ID will be created using AI to identify this cow even if RFID is lost.</p>
                </div>
              ) : (
                <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-200">
                  <p className="font-semibold mb-1">⚠️ No Biometric Data</p>
                  <p className="text-sm">This cow will be registered without biometric identification. You can add nose images later from the cow's profile.</p>
                </div>
              )}

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
                  {loading ? (
                    noseImages.length >= 3 ? 'Registering with Biometrics...' : 'Registering Cow...'
                  ) : (
                    'Confirm & Register'
                  )}
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
