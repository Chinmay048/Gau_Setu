import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GlassCard, GlassButton, GlassInput, ErrorAlert } from '../components/Common/GlassUI';

export const LoginPage = ({ userType = 'farmer' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, userType);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2">
          {userType === 'farmer' ? '🚜 Farmer' : '⚕️ Veterinarian'}
        </h1>
        <p className="text-white/70 mb-6">Login to your account</p>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <GlassInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <GlassButton
            variant="primary"
            className="w-full"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? 'Logging in...' : 'Login'}
          </GlassButton>
        </form>

        <p className="text-white/70 mt-6 text-center">
          Don't have an account?{' '}
          <Link
            to={userType === 'farmer' ? '/register-farmer' : '/register-vet'}
            className="text-blue-300 hover:text-blue-200 font-semibold"
          >
            Register here
          </Link>
        </p>

        <div className="mt-6 pt-6 border-t border-white/20">
          <p className="text-white/70 text-sm text-center mb-3">Login as different user type?</p>
          <Link
            to={userType === 'farmer' ? '/login-vet' : '/login-farmer'}
            className="block w-full text-center px-4 py-2 rounded-lg bg-white/10 text-white border border-white/30 hover:bg-white/20 transition-all"
          >
            {userType === 'farmer' ? 'Login as Vet' : 'Login as Farmer'}
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};

export default LoginPage;
