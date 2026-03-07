import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GlassCard, GlassButton, GlassInput, ErrorAlert } from '../components/Common/GlassUI';

export const RegisterVetPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    clinicName: '',
    licenseNumber: '',
    phoneNumber: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register(
        {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          clinicName: formData.clinicName,
          licenseNumber: formData.licenseNumber,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
        },
        'vet'
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h1 className="text-3xl font-bold text-white mb-2">⚕️ Register Veterinarian</h1>
        <p className="text-white/70 mb-6">Create your vet account</p>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit} className="space-y-3">
          <GlassInput
            label="Full Name"
            type="text"
            name="name"
            placeholder="Your name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <GlassInput
            label="Email"
            type="email"
            name="email"
            placeholder="Your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <GlassInput
            label="Clinic Name"
            type="text"
            name="clinicName"
            placeholder="Clinic name"
            value={formData.clinicName}
            onChange={handleChange}
            required
          />

          <GlassInput
            label="License Number"
            type="text"
            name="licenseNumber"
            placeholder="License number"
            value={formData.licenseNumber}
            onChange={handleChange}
            required
          />

          <GlassInput
            label="Phone Number"
            type="tel"
            name="phoneNumber"
            placeholder="Phone number"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />

          <GlassInput
            label="Address"
            type="text"
            name="address"
            placeholder="Clinic address"
            value={formData.address}
            onChange={handleChange}
            required
          />

          <GlassInput
            label="Password"
            type="password"
            name="password"
            placeholder="Create password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <GlassInput
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <GlassButton
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </GlassButton>
        </form>

        <p className="text-white/70 mt-4 text-center text-sm">
          Already registered?{' '}
          <Link to="/login-vet" className="text-orange-300 hover:text-orange-200 font-semibold">
            Login here
          </Link>
        </p>
      </GlassCard>
    </div>
  );
};

export default RegisterVetPage;
