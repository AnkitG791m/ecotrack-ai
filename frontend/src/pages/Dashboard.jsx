import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Leaf, Flame, Award, ArrowRight, Zap, Car, Carrot, Trash2, 
  Sparkles, CheckCircle2, Circle, AlertTriangle, FileText, Image
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import ImageAnalyzer from '../components/ImageAnalyzer';

const Dashboard = () => {
  const { user, token, authedFetch, refreshUser } = useAuth();
  const [latestReport, setLatestReport] = useState(null);
  const [habits, setHabits] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const location = useLocation();

  useEffect(() => {
    document.title = 'Dashboard | EcoTrack AI';
  }, []);

  useEffect(() => {
    document.getElementById('main-content')?.focus();
  }, [location]);
  
  const [scannerTab, setScannerTab] = useState('waste'); // 'waste' or 'bill'
  
  const [loading, setLoading] = useState(true);
  const [habitLoading, setHabitLoading] = useState(null);
  const [challengeCompleting, setChallengeCompleting] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch latest carbon report
        const reportRes = await authedFetch('/api/calculator/latest');
        const reportData = await reportRes.json();
        if (reportData.success) {
          setLatestReport(reportData.report);
        }

        // Fetch habits
        const habitsRes = await authedFetch('/api/habits');
        const habitsData = await habitsRes.json();
        if (habitsData.success) {
          setHabits(habitsData.habits);
        }

        // Fetch challenges
        const challengesRes = await authedFetch('/api/challenges');
        const challengesData = await challengesRes.json();
        if (challengesData.success) {
          setChallenges(challengesData.challenges.slice(0, 2)); // Show top 2 challenges
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Toggle habit checkoff
  const handleToggleHabit = async (habitId) => {
    setHabitLoading(habitId);
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      const res = await authedFetch('/api/habits/toggle', {
        method: 'POST',
        body: { habitId, date: todayStr }
      });
      const data = await res.json();
      if (data.success) {
        // Update local habits list completion
        setHabits(prev => prev.map(h => {
          if (h._id === habitId) {
            const hasDate = h.completedDates.indexOf(todayStr) !== -1;
            return {
              ...h,
              completedDates: hasDate 
                ? h.completedDates.filter(d => d !== todayStr) 
                : [...h.completedDates, todayStr],
              streak: data.streak
            };
          }
          return h;
        }));
        // Refresh User stats in AuthContext
        refreshUser();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHabitLoading(null);
    }
  };

  // Complete a daily challenge
  const handleCompleteChallenge = async (challengeId) => {
    setChallengeCompleting(challengeId);
    try {
      const res = await authedFetch(`/api/challenges/complete/${challengeId}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        // Refresh user info
        refreshUser();
      } else {
        alert(data.message || 'Already completed today!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChallengeCompleting(null);
    }
  };

  const getCategoryTheme = (category = 'yellow') => {
    const cat = category.toLowerCase();
    if (cat === 'green') return { text: 'text-brand-400', border: 'border-brand-500/25', bg: 'bg-brand-500/10', glow: 'shadow-brand-500/5', label: 'Eco Eco-Friendly (Green Zone)' };
    if (cat === 'red') return { text: 'text-red-400', border: 'border-red-500/25', bg: 'bg-red-500/10', glow: 'shadow-red-500/5', label: 'High Footprint (Red Zone)' };
    return { text: 'text-yellow-400', border: 'border-yellow-500/25', bg: 'bg-yellow-500/10', glow: 'shadow-yellow-500/5', label: 'Average Footprint (Yellow Zone)' };
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const categoryStyle = getCategoryTheme(latestReport?.category);
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Eco Dashboard</h1>
          <p className="text-sm text-white/50 mt-1">Hello, {user?.name}. Keep making green choices today!</p>
        </div>
        <div className="flex items-center space-x-2">
          {user?.badges?.slice(0, 2).map((b, i) => (
            <span key={i} className="text-xs bg-brand-500/10 border border-brand-500/25 text-brand-300 px-3 py-1 rounded-full font-bold">
              🏆 {b}
            </span>
          ))}
        </div>
      </div>

      {/* Main Score & Habit Tracker Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Carbon score display card */}
        <GlassCard className={`lg:col-span-2 ${categoryStyle.border} ${categoryStyle.glow}`} hoverable={false}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <span className="text-xs font-bold text-white/40 tracking-wider uppercase">Your Annual Footprint</span>
              {latestReport ? (
                <div className="space-y-2">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-5xl font-black">{latestReport.annualEstimation}</span>
                    <span className="text-lg font-bold text-white/60">Tons CO₂ / year</span>
                  </div>
                  <div className={`w-fit px-3 py-1 rounded-full text-xs font-bold border ${categoryStyle.bg} ${categoryStyle.text}`}>
                    {categoryStyle.label}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-white/60">You haven't calculated your footprint yet!</p>
                  <Link to="/calculator" className="glass-button-primary !px-4 !py-2 text-xs font-bold inline-flex items-center space-x-2">
                    <span>Calculate Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Score Breakdown (Gauges) */}
            {latestReport && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-grow max-w-lg">
                {[
                  { name: 'Transport', val: latestReport.transportScore, icon: Car, color: 'text-blue-400 border-blue-500/20' },
                  { name: 'Energy', val: latestReport.energyScore, icon: Zap, color: 'text-yellow-400 border-yellow-500/20' },
                  { name: 'Food', val: latestReport.foodScore, icon: Carrot, color: 'text-orange-400 border-orange-500/20' },
                  { name: 'Waste', val: latestReport.wasteScore, icon: Trash2, color: 'text-purple-400 border-purple-500/20' }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-xl text-center space-y-1.5 hover:bg-white/[0.04] transition-all">
                      <Icon className={`h-4.5 w-4.5 mx-auto ${item.color.split(' ')[0]}`} />
                      <span className="text-[10px] text-white/40 block font-semibold uppercase">{item.name}</span>
                      <span className="text-xs font-black block">{Math.round(item.val)} <span className="text-[9px] font-normal text-white/40">kg</span></span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {latestReport && (
            <div className="mt-6 pt-5 border-t border-white/[0.05] flex items-center justify-between">
              <span className="text-xs text-white/40 font-medium">Calculation updated on {new Date(latestReport.createdAt).toLocaleDateString()}</span>
              <Link to="/calculator" className="text-xs text-brand-400 hover:text-brand-300 font-semibold hover:underline flex items-center space-x-1">
                <span>Update Audit</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </GlassCard>

        {/* Daily Habits Trackers */}
        <GlassCard className="border-white/[0.08]" hoverable={false}>
          <div className="space-y-4 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
                <Sparkles className="h-4.5 w-4.5 text-brand-400" />
                <span>Daily Habit Check-in</span>
              </h3>
              
              <div className="space-y-2.5">
                {habits.map((habit) => {
                  const isCompletedToday = habit.completedDates.indexOf(todayStr) !== -1;
                  return (
                    <div 
                      key={habit._id} 
                      tabIndex="0"
                      onClick={() => handleToggleHabit(habit._id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleToggleHabit(habit._id)}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <div className="flex items-center space-x-2.5">
                        {habitLoading === habit._id ? (
                          <div className="w-4 h-4 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
                        ) : isCompletedToday ? (
                          <CheckCircle2 className="h-4.5 w-4.5 text-brand-400" />
                        ) : (
                          <Circle className="h-4.5 w-4.5 text-white/20" />
                        )}
                        <span className={`text-xs ${isCompletedToday ? 'text-white/40 line-through' : 'text-white/80'}`}>{habit.name}</span>
                      </div>
                      <span className="text-[10px] bg-brand-500/10 border border-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full font-bold">
                        🔥 {habit.streak}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-[10px] text-white/40 mt-3 italic text-center">
              Each tick awards +10 XP and reduces carbon output.
            </div>
          </div>
        </GlassCard>
      </div>

      {/* AI Scanner widgets & Daily Challenges Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Tabbed Image Analyzer & Electricity bill scanner */}
        <GlassCard className="lg:col-span-2 border-white/[0.08]" hoverable={false}>
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5 mb-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Scanners</h3>
            <div className="flex bg-white/[0.04] border border-white/[0.08] p-0.5 rounded-xl">
              <button
                onClick={() => setScannerTab('waste')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  scannerTab === 'waste' 
                    ? 'bg-brand-500 text-dark-950 shadow-md' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Image className="h-3.5 w-3.5" />
                <span>Waste Classifier</span>
              </button>
              <button
                onClick={() => setScannerTab('bill')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  scannerTab === 'bill' 
                    ? 'bg-brand-500 text-dark-950 shadow-md' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Bill Scanner</span>
              </button>
            </div>
          </div>

          {scannerTab === 'waste' ? (
            <ImageAnalyzer mode="waste" />
          ) : (
            <ImageAnalyzer mode="bill" />
          )}
        </GlassCard>

        {/* Daily Challenges */}
        <GlassCard className="border-white/[0.08]" hoverable={false}>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Challenges</h3>
              <Link to="/challenges" className="text-xs text-brand-400 hover:text-brand-300 font-semibold hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {challenges.map((ch) => {
                const alreadyCompleted = user?.completedChallenges?.some(item => {
                  const compDate = new Date(item.completedAt).toDateString();
                  const todayStr = new Date().toDateString();
                  return item.challenge === ch._id && compDate === todayStr;
                });

                return (
                  <div key={ch._id} className="p-4 bg-white/[0.01] border border-white/[0.05] rounded-xl flex flex-col justify-between space-y-3 hover:border-white/[0.08] transition-all">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white">{ch.title}</h4>
                      <p className="text-[11px] text-white/50 leading-relaxed">{ch.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] bg-brand-500/10 border border-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full font-bold">
                        +{ch.points} XP
                      </span>
                      
                      <button
                        onClick={() => handleCompleteChallenge(ch._id)}
                        disabled={challengeCompleting === ch._id || alreadyCompleted}
                        className={`text-[10px] font-bold px-3.5 py-1.5 rounded-lg border transition-all ${
                          alreadyCompleted 
                            ? 'bg-brand-500/10 border-brand-500/20 text-brand-300 cursor-not-allowed'
                            : 'bg-white/[0.04] border-white/[0.1] hover:bg-white/[0.08] text-white'
                        }`}
                      >
                        {challengeCompleting === ch._id ? 'Completing...' : alreadyCompleted ? 'Completed Today' : 'Complete Challenge'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* AI Recommendations CTA */}
      <GlassCard className="bg-gradient-to-r from-brand-950/40 via-dark-900 to-dark-900 border-brand-500/10 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-brand-500/5 hover:border-brand-500/20 transition-all">
        <div className="space-y-2 text-center sm:text-left max-w-xl">
          <div className="inline-flex items-center space-x-1 bg-brand-500/10 border border-brand-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-brand-300">
            <Sparkles className="h-3 w-3 animate-pulse" />
            <span>AI Recommendation Engine</span>
          </div>
          <h3 className="text-lg font-bold text-white">Unlock personalized green living advice</h3>
          <p className="text-xs text-white/50 leading-relaxed">
            Our Gemini AI model audits your weekly transport and energy figures to generate custom weekly routines and reduction targets.
          </p>
        </div>
        <Link 
          to="/recommendations" 
          className="w-full sm:w-auto glass-button-primary !px-5 !py-2.5 text-xs font-bold flex items-center justify-center space-x-2"
        >
          <span>Open AI Recommendations</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </GlassCard>
    </div>
  );
};

export default Dashboard;
