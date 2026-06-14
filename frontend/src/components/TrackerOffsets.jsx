import React, { memo } from 'react';
import { Trees } from 'lucide-react';
import GlassCard from './GlassCard';

const TrackerOffsets = ({ metrics, history, treesOffset, setTreesOffset, latestReport }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Goal progress card */}
      <GlassCard className="border-white/[0.08]" hoverable={false}>
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Goal Progress</h3>
          <p className="text-xs text-white/50 leading-relaxed">
            Tracking your progress towards a **20% carbon reduction goal** compared to your baseline. Keep completing habits to boost this!
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-white/60">Milestone Progress</span>
              <span className="text-brand-300">{metrics.goalProgress}%</span>
            </div>
            <div className="w-full h-3 bg-white/[0.03] border border-white/[0.06] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-500" 
                style={{ width: `${metrics.goalProgress}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-white/40">
            <span>Baseline: {history[0] ? `${history[0].annualEstimation} Tons` : '5.8 Tons'}</span>
            <span>Target: {history[0] ? `${(history[0].annualEstimation * 0.8).toFixed(2)} Tons` : '4.64 Tons'}</span>
          </div>
        </div>
      </GlassCard>

      {/* Carbon Offset Calculator slider */}
      <GlassCard className="border-white/[0.08] relative overflow-hidden" hoverable={false}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-xl" />
        
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <Trees className="h-4.5 w-4.5 text-brand-400" />
            <span>Interactive Offset Estimator</span>
          </h3>
          <p className="text-xs text-white/50 leading-relaxed">
            Select how many mature trees you plan to plant. Each tree absorbs approx **20kg of CO₂** annually.
          </p>

          {/* Slider */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-white/70">Number of Trees</span>
              <span className="text-brand-300 font-bold">{treesOffset} Trees</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={treesOffset}
              onChange={(e) => setTreesOffset(parseInt(e.target.value))}
              className="w-full accent-brand-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Equivalency output card */}
          <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider block">Carbon Absorbed</span>
              <span className="text-xl font-black text-white">{treesOffset * 20} <span className="text-xs font-semibold text-white/60">kg CO₂ / yr</span></span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-white/40 font-semibold uppercase block">Offset Status</span>
              <span className="text-xs font-bold text-white">
                {Math.round(((treesOffset * 20) / ((latestReport?.score || 300))) * 100)}% of latest audit
              </span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default memo(TrackerOffsets);
