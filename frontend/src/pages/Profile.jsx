import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { 
  User as UserIcon, Mail, Globe, Calendar, Award, Flame, 
  Sparkles, ShieldCheck, CheckCircle2, AlertTriangle, Lock
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const location = useLocation();

  useEffect(() => {
    document.title = 'Profile | EcoTrack AI';
  }, []);

  useEffect(() => {
    document.getElementById('main-content')?.focus();
  }, [location]);

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age || '');
  const [country, setCountry] = useState(user?.country || 'Global');
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name) {
      setError('Name is required.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const updateData = {
      name,
      age: age ? parseInt(age) : undefined,
      country,
      profilePhoto: profilePhoto || undefined,
    };

    if (password) {
      updateData.password = password;
    }

    const res = await updateProfile(updateData);
    if (res.success) {
      setSuccess('Profile successfully updated!');
      setPassword('');
    } else {
      setError(res.message || 'Failed to update profile.');
    }
    setLoading(false);
  };

  const badgesList = [
    { name: 'Eco Beginner', desc: 'Starting your sustainability audit journey.', icon: '🌱' },
    { name: 'Green Warrior', desc: 'Maintained moderate carbon footprint score (< 6.0 tons/year).', icon: '🛡️' },
    { name: 'Climate Hero', desc: 'Achieved excellent footprint limits (< 3.5 tons/year).', icon: '🦸' },
    { name: 'Eco Champion', desc: 'Earned 500+ XP points via challenges and login actions.', icon: '👑' },
    { name: 'Planet Protector', desc: 'Earned 1000+ XP points. True protector of the biosphere.', icon: '🌍' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12 font-sans">
      
      {/* Sidebar Profile Info & Badges */}
      <div className="space-y-6">
        
        {/* User Card */}
        <GlassCard className="text-center border-white/[0.08] relative overflow-hidden" hoverable={false}>
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-400 to-emerald-500" />
          <div className="space-y-4 py-4">
            <div className="relative w-24 h-24 mx-auto">
              <img 
                src={user?.profilePhoto} 
                alt={user?.name} 
                className="w-24 h-24 rounded-full object-cover border-2 border-brand-500/30 shadow-lg mx-auto" 
              />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <span className="text-xs bg-brand-500/10 border border-brand-500/20 text-brand-300 px-3 py-0.5 rounded-full font-bold uppercase">
                {user?.points} XP
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/[0.04] pt-5 mt-4 text-center">
              <div className="space-y-0.5">
                <Flame className="h-5 w-5 text-orange-400 mx-auto fill-orange-500/5" />
                <span className="text-[10px] text-white/40 block uppercase font-semibold">Streak</span>
                <span className="text-sm font-bold text-white block">{user?.streak} Days</span>
              </div>
              <div className="space-y-0.5">
                <ShieldCheck className="h-5 w-5 text-emerald-400 mx-auto" />
                <span className="text-[10px] text-white/40 block uppercase font-semibold">Saved CO₂</span>
                <span className="text-sm font-bold text-white block">{user?.carbonSaved} kg</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Badges Earned */}
        <GlassCard className="border-white/[0.08]" hoverable={false}>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-1.5">
            <Award className="h-4.5 w-4.5 text-brand-400" />
            <span>Badges & Achievements</span>
          </h3>

          <div className="space-y-3">
            {badgesList.map((badge, idx) => {
              const hasBadge = user?.badges?.includes(badge.name);
              return (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border flex items-center space-x-3 transition-all ${
                    hasBadge 
                      ? 'bg-brand-500/5 border-brand-500/20 text-white' 
                      : 'bg-white/[0.01] border-white/[0.04] text-white/30'
                  }`}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <div className="space-y-0.5">
                    <h4 className={`text-xs font-bold ${hasBadge ? 'text-white' : 'text-white/30'}`}>{badge.name}</h4>
                    <p className="text-[9px] leading-relaxed opacity-80">{badge.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Main Settings Edit Form Column */}
      <div className="lg:col-span-2">
        <GlassCard className="border-white/[0.08]" hoverable={false}>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center space-x-2">
            <UserIcon className="h-4.5 w-4.5 text-brand-400" />
            <span>Profile Settings</span>
          </h3>

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

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-white/60 font-semibold pl-1">Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                    <UserIcon className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="glass-input !pl-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-white/60 font-semibold pl-1">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/20">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="glass-input !pl-10 text-sm opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-white/60 font-semibold pl-1">Age</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="glass-input !pl-10 text-sm"
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
                    className="glass-input !pl-10 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-white/60 font-semibold pl-1">Profile Photo URL</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                  <Sparkles className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={profilePhoto}
                  onChange={(e) => setProfilePhoto(e.target.value)}
                  className="glass-input !pl-10 text-sm"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-white/60 font-semibold pl-1">Update Password (Optional)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="glass-input !pl-10 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full glass-button-primary !mt-6"
            >
              {loading ? 'Saving Changes...' : 'Save Settings'}
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default Profile;
