import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { Trophy, Award, Flame, Search, ShieldAlert } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Leaderboard = () => {
  const { authedFetch } = useAuth();
  const location = useLocation();

  useEffect(() => {
    document.title = 'Leaderboard | EcoTrack AI';
  }, []);

  useEffect(() => {
    document.getElementById('main-content')?.focus();
  }, [location]);
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [filter, setFilter] = useState('all-time'); // 'daily', 'weekly', 'monthly', 'all-time'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await authedFetch(`/api/leaderboard?filter=${filter}`);
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [filter]);

  const getRankBadge = (rank) => {
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return <span className="text-xs font-bold text-white/40 w-6 h-6 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto">{rank}</span>;
  };

  const getRankRowStyle = (rank) => {
    if (rank === 1) return 'bg-yellow-500/[0.04] border-yellow-500/10';
    if (rank === 2) return 'bg-slate-400/[0.04] border-slate-400/10';
    if (rank === 3) return 'bg-amber-600/[0.04] border-amber-600/10';
    return 'bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.02]';
  };

  const filteredLeaderboard = leaderboard.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center space-x-2">
            <Trophy className="h-7 w-7 text-brand-400" />
            <span>Leaderboard</span>
          </h1>
          <p className="text-sm text-white/50 mt-1">See how your carbon points and savings rank against the global community.</p>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02] border border-white/[0.06] p-3 rounded-2xl">
        <div className="flex bg-white/[0.04] border border-white/[0.08] p-0.5 rounded-xl w-full sm:w-auto overflow-x-auto">
          {['daily', 'weekly', 'monthly', 'all-time'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === tab 
                  ? 'bg-brand-500 text-dark-950 font-bold' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search eco warrior..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-brand-500/40 text-white placeholder-white/30"
          />
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        /* Leaderboard table */
        <div className="space-y-3">
          {/* Header Row */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-2 text-[10px] text-white/40 font-bold uppercase tracking-wider">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-4">Warrior Name</div>
            <div className="col-span-3">Country</div>
            <div className="col-span-3 text-right">Points / Saved CO₂</div>
          </div>

          {/* User Rows */}
          {filteredLeaderboard.map((item) => (
            <div 
              key={item._id} 
              className={`grid grid-cols-12 gap-4 px-6 py-4 rounded-xl border flex items-center transition-all ${getRankRowStyle(item.rank)}`}
            >
              <div className="col-span-2 text-center flex items-center justify-center">
                {getRankBadge(item.rank)}
              </div>
              
              {/* Warrior profile */}
              <div className="col-span-10 sm:col-span-4 flex items-center space-x-3">
                <img 
                  src={item.profilePhoto} 
                  alt={item.name} 
                  className="h-8 w-8 rounded-full object-cover border border-white/10" 
                />
                <div className="truncate">
                  <h4 className="text-xs font-bold text-white leading-tight truncate">{item.name}</h4>
                  <div className="flex items-center space-x-1.5 mt-0.5 sm:hidden">
                    <span className="text-[9px] text-white/40">{item.country}</span>
                  </div>
                  {item.badges && item.badges.length > 0 && (
                    <span className="hidden sm:inline-block text-[9px] bg-brand-500/10 text-brand-300 border border-brand-500/20 px-1.5 py-0.5 rounded font-bold uppercase mt-1">
                      {item.badges[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* Country */}
              <div className="hidden sm:block col-span-3 text-xs text-white/70">
                {item.country || 'Global'}
              </div>

              {/* Points */}
              <div className="col-span-12 sm:col-span-3 text-right flex sm:block items-center justify-between border-t border-white/[0.04] sm:border-0 pt-2.5 sm:pt-0 mt-2 sm:mt-0">
                <span className="sm:hidden text-[10px] text-white/40 uppercase font-semibold">Performance</span>
                <div className="space-y-0.5">
                  <span className="text-xs font-black block text-brand-300">{item.points} XP</span>
                  <span className="text-[10px] text-white/40 block font-medium">Saves: {item.carbonSaved} kg CO₂</span>
                </div>
              </div>
            </div>
          ))}

          {filteredLeaderboard.length === 0 && (
            <div className="text-center py-12 text-white/40 text-xs">
              No users found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
