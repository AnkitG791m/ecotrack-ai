import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import { 
  Sparkles, CheckCircle2, AlertTriangle, Calendar, Target, 
  TrendingDown, TrendingUp, HelpCircle, ArrowRight, RefreshCw, Leaf
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Recommendations = () => {
  const { authedFetch } = useAuth();
  const [recReport, setRecReport] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    document.title = 'Recommendations | EcoTrack AI';
  }, []);

  useEffect(() => {
    document.getElementById('main-content')?.focus();
  }, [location]);

  const fetchRecommendationsAndPredictions = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch recommendations
      const recRes = await authedFetch('/api/ai/recommendations');
      const recData = await recRes.json();
      
      if (recData.success) {
        setRecReport(recData.report);
      } else {
        setError(recData.message || 'No recommendations generated yet. Have you calculated your carbon footprint?');
        setLoading(false);
        return;
      }

      // Fetch predictions
      const predRes = await authedFetch('/api/ai/predict');
      const predData = await predRes.json();
      if (predData.success) {
        setPrediction(predData);
      }
    } catch (err) {
      setError('Connection failed. Please verify that the server is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendationsAndPredictions();
  }, []);

  const getTrendIcon = (direction = '') => {
    const dir = direction.toLowerCase();
    if (dir === 'improving') return <TrendingDown className="h-5 w-5 text-brand-400" />;
    if (dir === 'worsening') return <TrendingUp className="h-5 w-5 text-red-400" />;
    return <HelpCircle className="h-5 w-5 text-yellow-400" />;
  };

  const getTrendColor = (direction = '') => {
    const dir = direction.toLowerCase();
    if (dir === 'improving') return 'text-brand-400 bg-brand-500/10 border-brand-500/20';
    if (dir === 'worsening') return 'text-red-400 bg-red-500/10 border-red-500/20';
    return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 font-sans relative">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center space-x-2.5">
            <Sparkles className="h-7 w-7 text-brand-400 animate-pulse" />
            <span>AI Eco Insights</span>
          </h1>
          <p className="text-sm text-white/50 mt-1">Personalized carbon reduction roadmaps powered by Gemini AI.</p>
        </div>
        <button
          onClick={fetchRecommendationsAndPredictions}
          className="w-full md:w-auto glass-button-secondary !px-3.5 !py-2 text-xs font-bold flex items-center justify-center space-x-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {error ? (
        <GlassCard className="border-red-500/20 p-8 text-center space-y-4" hoverable={false}>
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto" />
          <h3 className="text-lg font-bold">Recommendations Not Available</h3>
          <p className="text-sm text-white/50 max-w-md mx-auto">{error}</p>
          <Link to="/calculator" className="glass-button-primary !px-5 !py-2.5 text-xs font-bold inline-flex items-center space-x-2">
            <span>Go to Carbon Calculator</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Plan & Recommendations Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Actionable recommendations */}
            <GlassCard className="border-white/[0.08]" hoverable={false}>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-brand-400" />
                <span>Personalized Recommendations</span>
              </h3>
              
              <div className="space-y-3">
                {recReport?.recommendations?.map((rec, i) => (
                  <div 
                    key={i} 
                    className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl flex items-start space-x-3.5 hover:border-brand-500/10 hover:bg-white/[0.02] transition-all"
                  >
                    <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-300 text-xs font-bold">
                      {i + 1}
                    </span>
                    <p className="text-xs text-white/80 leading-relaxed pt-0.5">{rec}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Weekly Plan */}
            <GlassCard className="border-white/[0.08]" hoverable={false}>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center space-x-2">
                <Calendar className="h-4.5 w-4.5 text-brand-400" />
                <span>Weekly Carbon Reduction Action Plan</span>
              </h3>

              <div className="relative pl-6 border-l border-white/[0.06] space-y-6 ml-3 py-1">
                {recReport?.weeklyPlan?.map((dayText, i) => {
                  const parts = dayText.split(':');
                  const dayTitle = parts[0];
                  const dayDesc = parts.slice(1).join(':');

                  return (
                    <div key={i} className="relative group">
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-dark-900 border border-brand-500/40 group-hover:border-brand-400 transition-colors">
                        <span className="h-2 w-2 rounded-full bg-brand-500 group-hover:bg-brand-400" />
                      </span>
                      
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider">{dayTitle}</h4>
                        <p className="text-xs text-white/70 leading-relaxed">{dayDesc.trim()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          {/* Goals & Predictions Sidebar Column */}
          <div className="space-y-6">
            
            {/* Monthly Target Card */}
            <GlassCard className="border-white/[0.08] relative overflow-hidden" hoverable={false}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-xl" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
                <Target className="h-4.5 w-4.5 text-brand-400" />
                <span>Monthly Reduction Goal</span>
              </h3>
              <p className="text-xs text-white/80 leading-relaxed bg-white/[0.01] border border-white/[0.05] p-4 rounded-xl shadow-inner">
                {recReport?.monthlyGoal}
              </p>
            </GlassCard>

            {/* AI Trend Footprint Prediction */}
            {prediction && (
              <GlassCard className="border-white/[0.08]" hoverable={false}>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
                  <Sparkles className="h-4.5 w-4.5 text-brand-400" />
                  <span>Footprint Prediction</span>
                </h3>
                
                <div className="space-y-4">
                  {/* Score comparison */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.02] border border-white/[0.05] p-3.5 rounded-xl text-center">
                      <span className="text-[10px] text-white/40 block font-semibold uppercase mb-1">Current Score</span>
                      <span className="text-xl font-black">{prediction.currentScore} <span className="text-[10px] font-normal text-white/40">kg/wk</span></span>
                    </div>
                    <div className="bg-brand-500/5 border border-brand-500/10 p-3.5 rounded-xl text-center">
                      <span className="text-[10px] text-brand-400 block font-bold uppercase mb-1">Predicted Next Month</span>
                      <span className="text-xl font-black text-brand-300">{prediction.predictedNextMonthScore} <span className="text-[10px] font-normal text-brand-400">kg/wk</span></span>
                    </div>
                  </div>

                  {/* Trend Badge */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${getTrendColor(prediction.trendDirection)}`}>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(prediction.trendDirection)}
                      <span className="text-xs font-bold uppercase tracking-wider">Trend: {prediction.trendDirection}</span>
                    </div>
                    <span className="text-[10px] font-semibold opacity-80">Next 30 Days</span>
                  </div>

                  {/* Prediction Message text */}
                  <p className="text-[11px] text-white/50 leading-relaxed text-center italic">
                    "{prediction.message}"
                  </p>

                  {/* Offset equivalences */}
                  <div className="pt-2 border-t border-white/[0.05] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40">Estimated Annual Tons:</span>
                      <span className="font-bold text-white/95">{prediction.annualEstimationTons} Tons</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40">Projected Annual Offset:</span>
                      <div className="flex items-center space-x-1 font-bold text-brand-300">
                        <Leaf className="h-3.5 w-3.5" />
                        <span>{prediction.predictedNextMonthTons} Tons</span>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* General AI bot FAQ panel */}
            <GlassCard className="bg-gradient-to-br from-dark-900 to-brand-950/20 border-white/[0.08]" hoverable={false}>
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white">Need custom advice?</h4>
                <p className="text-[11px] text-white/50 leading-relaxed">
                  Open the green chat bubble on the bottom right to talk to **EcoBot** for direct answers to questions like "Which plastic triangle codes can be recycled?".
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
