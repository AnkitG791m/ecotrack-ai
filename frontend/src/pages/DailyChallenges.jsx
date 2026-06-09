import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { Award, Flame, Star, CheckCircle, Info, Sparkles, Filter } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const DailyChallenges = () => {
  const { user, token, authedFetch, refreshUser } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'easy', 'medium', 'hard'
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    document.title = 'Daily Challenges | EcoTrack AI';
  }, []);

  useEffect(() => {
    document.getElementById('main-content')?.focus();
  }, [location]);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const res = await authedFetch('/api/challenges');
      const data = await res.json();
      if (data.success) {
        setChallenges(data.challenges);
      }
    } catch (err) {
      console.error('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleComplete = async (challengeId) => {
    setCompletingId(challengeId);
    try {
      const res = await authedFetch(`/api/challenges/complete/${challengeId}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Challenge completed!');
        refreshUser();
      } else {
        alert(data.message || 'Already completed today!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCompletingId(null);
    }
  };

  const getDifficultyColor = (diff = '') => {
    const d = diff.toLowerCase();
    if (d === 'easy') return 'text-brand-400 bg-brand-500/10 border-brand-500/20';
    if (d === 'hard') return 'text-red-400 bg-red-500/10 border-red-500/20';
    return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
  };

  const filteredChallenges = challenges.filter(ch => {
    if (filter === 'all') return true;
    return ch.difficulty.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center space-x-2">
            <Award className="h-7 w-7 text-brand-400" />
            <span>Daily Challenges</span>
          </h1>
          <p className="text-sm text-white/50 mt-1">Complete daily tasks to gain XP and establish sustainable habits.</p>
        </div>

        {/* User stats overview */}
        <div className="flex items-center space-x-3 bg-white/[0.02] border border-white/[0.05] px-4 py-2 rounded-2xl">
          <div className="flex items-center space-x-1.5 pr-3.5 border-r border-white/5">
            <Flame className="h-4.5 w-4.5 text-orange-400 fill-orange-500/10" />
            <div>
              <span className="text-xs text-white/40 block leading-none font-semibold">STREAK</span>
              <span className="text-sm font-bold text-white leading-none mt-0.5">{user?.streak} Days</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-white/40 block leading-none font-semibold">TOTAL XP</span>
            <span className="text-sm font-bold text-brand-300 leading-none mt-0.5">{user?.points}</span>
          </div>
        </div>
      </div>

      {/* Filter and Content Area */}
      <div className="space-y-6">
        
        {/* Filters bar */}
        <div className="flex items-center space-x-2 bg-white/[0.02] border border-white/[0.06] p-1 rounded-xl w-fit">
          {['all', 'easy', 'medium', 'hard'].map(diff => (
            <button
              key={diff}
              onClick={() => setFilter(diff)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === diff
                  ? 'bg-brand-500 text-dark-950 font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredChallenges.map((ch) => {
            const alreadyCompleted = user?.completedChallenges?.some(item => {
              const compDate = new Date(item.completedAt).toDateString();
              const todayStr = new Date().toDateString();
              return item.challenge === ch._id && compDate === todayStr;
            });

            return (
              <GlassCard key={ch._id} className="border-white/[0.08]" hoverable={false}>
                <div className="flex flex-col justify-between h-full space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${getDifficultyColor(ch.difficulty)}`}>
                        {ch.difficulty}
                      </span>
                      <div className="flex items-center space-x-1 text-xs text-white/40">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500/10" />
                        <span className="font-semibold text-brand-300">+{ch.points} XP</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white">{ch.title}</h3>
                      <p className="text-xs text-white/50 leading-relaxed">{ch.description}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                    <span className="text-[10px] text-white/30 font-medium flex items-center space-x-1">
                      <Info className="h-3 w-3" />
                      <span>Saves approx 2kg CO₂</span>
                    </span>

                    <button
                      onClick={() => handleComplete(ch._id)}
                      disabled={completingId === ch._id || alreadyCompleted}
                      className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
                        alreadyCompleted
                          ? 'bg-brand-500/10 border-brand-500/20 text-brand-300 cursor-not-allowed flex items-center space-x-1'
                          : 'bg-brand-500 hover:bg-brand-400 text-dark-950 border-brand-500 hover:shadow-brand-500/10'
                      }`}
                    >
                      {completingId === ch._id ? (
                        <div className="w-3.5 h-3.5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin"></div>
                      ) : alreadyCompleted ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Completed</span>
                        </>
                      ) : (
                        'Complete Challenge'
                      )}
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="text-center py-12 text-white/40 text-xs">
            No challenges found matching this difficulty filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyChallenges;
