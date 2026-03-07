import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import logo from '@/assets/gausetu-logo.png';

const roles = [
  { id: 'farmer', label: 'Farmer', emoji: '🧑‍🌾' },
  { id: 'vet', label: 'Veterinarian', emoji: '🩺' },
  { id: 'government', label: 'Government', emoji: '🏛️' },
];

const demoCredentials: Record<string, { email: string; password: string }> = {
  farmer: { email: 'demo@farmer.com', password: 'demo123' },
  vet: { email: 'dr.mehta@vet.com', password: 'demo123' },
  government: { email: 'gov.mh@govt.com', password: 'demo123' },
};

const Login = () => {
  const [role, setRole] = useState('farmer');
  const [loginMethod, setLoginMethod] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, loginOTP } = useAuth();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!phone) return;
    setLoading(true);
    setError('');
    try {
      await authAPI.otpSend(phone);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginOTP(phone, otp);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    const creds = demoCredentials[role];
    setEmail(creds.email);
    setPassword(creds.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <img src={logo} alt="GauSetu" className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to GauSetu</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Role selector */}
          <div className="flex gap-2 mb-5">
            {roles.map(r => (
              <button
                key={r.id}
                onClick={() => { setRole(r.id); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  role === r.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {r.emoji} {r.label}
              </button>
            ))}
          </div>

          {/* Login method toggle (farmer only) */}
          {role === 'farmer' && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setLoginMethod('email'); setError(''); }}
                className={`flex-1 py-1.5 rounded text-xs font-medium ${loginMethod === 'email' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
              >
                Email & Password
              </button>
              <button
                onClick={() => { setLoginMethod('otp'); setError(''); }}
                className={`flex-1 py-1.5 rounded text-xs font-medium ${loginMethod === 'otp' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
              >
                Phone OTP
              </button>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Email/Password form */}
          {(loginMethod === 'email' || role !== 'farmer') && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-gradient-saffron hover:opacity-90" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          )}

          {/* OTP form */}
          {loginMethod === 'otp' && role === 'farmer' && (
            <form onSubmit={handleOTPLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <div className="flex gap-2">
                  <Input placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  <Button type="button" variant="outline" onClick={handleSendOTP} disabled={loading || !phone}>
                    {otpSent ? 'Resend' : 'Send OTP'}
                  </Button>
                </div>
              </div>
              {otpSent && (
                <div className="space-y-2">
                  <Label>OTP Code</Label>
                  <Input placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} />
                  <p className="text-xs text-muted-foreground">Demo OTP: 123456</p>
                </div>
              )}
              <Button type="submit" className="w-full bg-gradient-saffron hover:opacity-90" disabled={loading || !otpSent}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </Button>
            </form>
          )}

          {role === 'farmer' && (
            <div className="mt-4 text-center text-sm">
              <p className="text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-semibold hover:underline">Register here</Link>
              </p>
            </div>
          )}

          <div className="mt-5 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-muted-foreground">Demo Credentials ({roles.find(r => r.id === role)?.label}):</p>
              <button onClick={fillDemo} className="text-xs text-primary font-medium hover:underline">Auto-fill</button>
            </div>
            <p className="text-xs text-muted-foreground">Email: {demoCredentials[role].email}</p>
            <p className="text-xs text-muted-foreground">Password: {demoCredentials[role].password}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
