import React from 'react';
import { Sparkles, Leaf, ShieldAlert, Info, RefreshCw } from 'lucide-react';
import GlassCard from './GlassCard';

const CalculatorResults = ({ result, pointsEarned, resetCalculator, navigate }) => {
  const getZoneDetails = (category = '') => {
    const cat = category.toLowerCase();
    if (cat === 'green') {
      return {
        title: 'Green Zone',
        color: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
        desc: 'Eco-Friendly: Your carbon footprint is well within sustainable boundaries (< 3.5 tons/year). Great job!',
        icon: Leaf
      };
    }
    if (cat === 'red') {
      return {
        title: 'Red Zone',
        color: 'text-red-400 bg-red-500/10 border-red-500/20',
        desc: 'High Emissions: Your carbon footprint is above standard targets (> 7 tons/year). Action is highly recommended!',
        icon: ShieldAlert
      };
    }
    return {
      title: 'Yellow Zone',
      color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      desc: 'Average footprint: Your carbon rating is moderate (3.5 - 7 tons/year). There is room for improvement!',
      icon: Info
    };
  };

  const zone = getZoneDetails(result.category);
  const ZoneIcon = zone.icon;

  return (
    <GlassCard className="border-white/[0.08]" hoverable={false}>
      <div className="text-center space-y-6 py-4">
        <div className="inline-flex items-center space-x-1.5 bg-brand-500/10 border border-brand-500/25 px-4 py-1.5 rounded-full text-xs font-bold text-brand-300 animate-bounce">
          <Sparkles className="h-4 w-4" />
          <span>Audit Completed: +{pointsEarned} XP Awarded!</span>
        </div>

        {/* Glowing circular score display */}
        <div className="relative w-44 h-44 mx-auto rounded-full bg-white/[0.01] border border-white/[0.05] flex flex-col items-center justify-center shadow-premium">
          <div className="absolute inset-0 rounded-full border border-brand-500/20 blur-sm animate-pulse" />
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Estimated Annual CO₂</span>
          <span className="text-5xl font-black text-gradient-green mt-1">{result.annualEstimation}</span>
          <span className="text-xs font-bold text-white/60 mt-1">Metric Tons</span>
        </div>

        <div className="max-w-md mx-auto space-y-3">
          <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${zone.color}`}>
            <ZoneIcon className="h-4 w-4" />
            <span>{zone.title}</span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed px-4">{zone.desc}</p>
        </div>

        {/* Carbon Offset Equivalent (Trees info) */}
        <div className="max-w-md mx-auto p-4 bg-brand-950/20 border border-brand-500/10 rounded-xl flex items-center space-x-4">
          <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl">
            <Leaf className="h-6 w-6 text-brand-400" />
          </div>
          <div className="text-left space-y-0.5">
            <h4 className="text-xs font-bold text-white">Tree Offset Equivalence</h4>
            <p className="text-[11px] text-white/50 leading-relaxed">
              You would need to plant approx <span className="text-brand-300 font-bold">{Math.round(result.score / 20)} mature trees</span> each year to completely absorb these carbon emissions.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 max-w-md mx-auto">
          <button
            onClick={() => navigate('/recommendations')}
            className="w-full glass-button-primary flex items-center justify-center space-x-1.5 text-xs font-bold"
          >
            <Sparkles className="h-4 w-4" />
            <span>View AI Recommendations</span>
          </button>
          <button
            onClick={resetCalculator}
            className="w-full glass-button-secondary flex items-center justify-center space-x-1.5 text-xs font-semibold"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retake Calculator</span>
          </button>
        </div>

        <div className="pt-2">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-xs text-white/40 hover:text-white font-semibold underline"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

export default CalculatorResults;
