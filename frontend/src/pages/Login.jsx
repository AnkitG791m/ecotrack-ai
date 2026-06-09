import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = 'Login | EcoTrack AI';
  }, []);

  useEffect(() => {
    document.getElementById('main-content')?.focus();
  }, [location]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const res = await login(email, password);
    if (res.success) {
      setSuccess(res.pointsAwarded > 0 
        ? `Welcome back! Daily Login Bonus: +${res.pointsAwarded} XP earned!` 
        : 'Successfully logged in!'
      );
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setError(res.message || 'Invalid email or password.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    // Simulate Google Login info
    const mockGoogleData = {
      name: 'Eco Warrior',
      email: 'ecowarrior@gmail.com',
      profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
    };

    const res = await googleLogin(mockGoogleData);
    if (res.success) {
      setSuccess('Successfully logged in with Google!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setError(res.message || 'Google Sign-In failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-6 font-sans">
      <div className="w-full max-w-md">
        <GlassCard className="border-white/[0.08] relative overflow-hidden" hoverable={false}>
          {/* Top Decorative bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-emerald-400" />

          {/* Heading */}
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
            <p className="text-xs text-white/50">Access your carbon metrics and daily tasks.</p>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="p-3 mb-4 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-400 flex items-center space-x-2.5">
              <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 mb-4 bg-brand-500/10 border border-brand-500/25 rounded-xl text-xs text-brand-400 flex items-center space-x-2.5 animate-pulse">
              <CheckCircle2 className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-white/60 font-semibold pl-1">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="glass-input !pl-10 text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-white/60 font-semibold pl-1">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input !pl-10 text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-brand-400 hover:text-brand-300 cursor-pointer font-semibold transition-colors">
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full glass-button-primary flex items-center justify-center space-x-2 !mt-6"
            >
              <LogIn className="h-4 w-4" />
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-white/[0.06]" />
            <span className="text-[10px] text-white/30 uppercase tracking-widest px-3">or continue with</span>
            <div className="flex-1 border-t border-white/[0.06]" />
          </div>

          {/* Google Login button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full glass-button-secondary flex items-center justify-center space-x-2 text-sm"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign In with Google</span>
          </button>

          {/* Footer Link */}
          <div className="text-center mt-6 text-xs text-white/50">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              Sign Up
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Login;
