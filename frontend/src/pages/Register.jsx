import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Globe, Calendar, UserPlus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = 'Register | EcoTrack AI';
  }, []);

  useEffect(() => {
    document.getElementById('main-content')?.focus();
  }, [location]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('Global');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const userData = {
      name,
      email,
      password,
      age: age ? parseInt(age) : undefined,
      country
    };

    const res = await register(userData);
    if (res.success) {
      setSuccess('Profile successfully created! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setError(res.message || 'Registration failed. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 font-sans">
      <div className="w-full max-w-md">
        <GlassCard className="border-white/[0.08] relative overflow-hidden" hoverable={false}>
          {/* Top Decorative Gradient */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-emerald-400" />

          {/* Title */}
          <div className="text-center space-y-2 mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Create Eco Profile</h2>
            <p className="text-xs text-white/50">Join the movement and start saving carbon today.</p>
          </div>

          {/* Feedback banners */}
          {error && (
            <div className="p-3 mb-4 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-400 flex items-center space-x-2.5">
              <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 mb-4 bg-brand-500/10 border border-brand-500/25 rounded-xl text-xs text-brand-400 flex items-center space-x-2.5">
              <CheckCircle2 className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-white/60 font-semibold pl-1">Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="glass-input !pl-10 text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-white/60 font-semibold pl-1">Email Address *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="glass-input !pl-10 text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-white/60 font-semibold pl-1">Password *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="glass-input !pl-10 text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Grid of Age & Country */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-white/60 font-semibold pl-1">Age (Years)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                    className="glass-input !pl-10 text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-white/60 font-semibold pl-1">Country</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                    <Globe className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="USA"
                    className="glass-input !pl-10 text-sm"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full glass-button-primary flex items-center justify-center space-x-2 !mt-6"
            >
              <UserPlus className="h-4 w-4" />
              <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center mt-6 text-xs text-white/50">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              Sign In
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Register;
