import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GlassCard, GlassButton, GlassInput, ErrorAlert } from '../components/Common/GlassUI';

export const RegisterFarmerPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    farmName: '',
    phoneNumber: '',
    location: '',
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
          farmName: formData.farmName,
          phoneNumber: formData.phoneNumber,
          location: formData.location,
        },
        'farmer'
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-teal-600 to-blue-600 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2">🚜 Register Farm</h1>
        <p className="text-white/70 mb-6">Create your farmer account</p>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            label="Email"
            type="email"
            name="email"
            placeholder="Farm email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <GlassInput
            label="Farm Name"
            type="text"
            name="farmName"
            placeholder="Your farm name"
            value={formData.farmName}
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
            label="Location"
            type="text"
            name="location"
            placeholder="Farm location"
            value={formData.location}
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

        <p className="text-white/70 mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login-farmer" className="text-green-300 hover:text-green-200 font-semibold">
            Login here
          </Link>
        </p>
      </GlassCard>
    </div>
  );
};

export default RegisterFarmerPage;
