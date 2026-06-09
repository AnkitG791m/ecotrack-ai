import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, AlertTriangle, Lightbulb, BarChart2, Calendar, FileText, CheckCircle2, RotateCcw } from 'lucide-react';
import GlassCard from './GlassCard';

const ImageAnalyzer = ({ mode = 'waste' }) => { // 'waste' or 'bill'
  const { token } = useAuth();
  const [image, setImage] = useState(null); // base64 data url
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, or WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) { // 8MB limit
      setError('Image size exceeds 8MB. Please choose a smaller image.');
      return;
    }

    setError('');
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setLoading(true);
    setError('');

    const url = mode === 'waste' ? '/api/ai/analyze-image' : '/api/ai/scan-bill';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ image })
      });

      const data = await res.json();
      if (data.success) {
        setResult(mode === 'waste' ? data.analysis : data.scan);
      } else {
        setError(data.message || 'Analysis failed. Please check the image content.');
      }
    } catch (err) {
      setError('Connection failed. Verify if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setImage(null);
    setResult(null);
    setError('');
  };

  const getImpactColor = (level = '') => {
    const lvl = level.toLowerCase();
    if (lvl === 'high' || lvl === 'red') return 'bg-red-500/10 border-red-500/35 text-red-400';
    if (lvl === 'medium' || lvl === 'yellow') return 'bg-yellow-500/10 border-yellow-500/35 text-yellow-400';
    return 'bg-brand-500/10 border-brand-500/35 text-brand-400';
  };

  return (
    <div className="w-full">
      {!result ? (
        <div className="flex flex-col items-center">
          {/* File Upload Zone */}
          {!image ? (
            <label className="w-full h-56 border-2 border-dashed border-white/10 rounded-2xl hover:border-brand-500/40 hover:bg-white/[0.01] flex flex-col items-center justify-center cursor-pointer transition-all relative group overflow-hidden">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl mb-3 group-hover:scale-105 transition-transform duration-300">
                <Upload className="h-6 w-6 text-brand-400" />
              </div>
              <p className="text-sm font-semibold text-white/80">
                {mode === 'waste' ? 'Upload waste or objects image' : 'Upload electricity bill scan'}
              </p>
              <p className="text-xs text-white/40 mt-1">PNG, JPG, or WEBP up to 8MB</p>
            </label>
          ) : (
            /* Image Preview & Analyze Actions */
            <div className="w-full flex flex-col items-center">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 max-h-60 w-full flex items-center justify-center bg-black/20">
                <img src={image} alt="Preview" className="object-contain max-h-60 rounded-2xl" />
                <button
                  onClick={resetScanner}
                  className="absolute top-3 right-3 p-1.5 bg-dark-950/80 border border-white/10 rounded-xl hover:bg-dark-900 transition-colors"
                >
                  <RotateCcw className="h-4 w-4 text-white/70" />
                </button>
              </div>

              {error && (
                <div className="w-full mt-3 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full mt-4 glass-button-primary flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Image...</span>
                  </>
                ) : (
                  <span>{mode === 'waste' ? 'Analyze Environmental Impact' : 'Scan & Extract Carbon Data'}</span>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results View */
        <div className="space-y-4">
          {mode === 'waste' ? (
            /* Waste Mode Results */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40 font-semibold tracking-wider uppercase">Detection Results</span>
                <button onClick={resetScanner} className="text-xs text-brand-400 font-semibold hover:underline flex items-center space-x-1">
                  <RotateCcw className="h-3 w-3" />
                  <span>Scan Another</span>
                </button>
              </div>

              {/* Detected items tag list */}
              <div className="flex flex-wrap gap-1.5">
                {result.detectedObjects?.map((obj, i) => (
                  <span key={i} className="text-xs bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-full text-white/95">
                    {obj}
                  </span>
                ))}
              </div>

              {/* Impact Card */}
              <div className={`p-4 rounded-xl border ${getImpactColor(result.impactLevel)}`}>
                <div className="flex items-center space-x-2 mb-1.5">
                  <AlertTriangle className="h-4.5 w-4.5" />
                  <span className="text-sm font-bold tracking-wide">{result.impactLevel} Environmental Impact</span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">{result.impactExplanation}</p>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Disposal Recommendations</h4>
                {result.recommendations?.map((rec, i) => (
                  <div key={i} className="flex items-start space-x-2.5 bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl">
                    <CheckCircle2 className="h-4 w-4 text-brand-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-white/80 leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Electricity Bill Mode Results */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40 font-semibold tracking-wider uppercase">Bill Scan Summary</span>
                <button onClick={resetScanner} className="text-xs text-brand-400 font-semibold hover:underline flex items-center space-x-1">
                  <RotateCcw className="h-3 w-3" />
                  <span>Scan Another</span>
                </button>
              </div>

              {/* Grid of Key Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.02] border border-white/[0.05] p-3.5 rounded-xl text-center">
                  <span className="text-[10px] text-white/40 block font-semibold uppercase mb-1">Billing Period</span>
                  <div className="flex items-center justify-center space-x-1 text-white">
                    <Calendar className="h-3.5 w-3.5 text-brand-400" />
                    <span className="text-xs font-bold">{result.billingPeriod || 'May 2026'}</span>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.05] p-3.5 rounded-xl text-center">
                  <span className="text-[10px] text-white/40 block font-semibold uppercase mb-1">Usage</span>
                  <div className="flex items-center justify-center space-x-1 text-white">
                    <FileText className="h-3.5 w-3.5 text-brand-400" />
                    <span className="text-xs font-bold">{result.unitsConsumed} Units (kWh)</span>
                  </div>
                </div>
              </div>

              {/* Emissions visual block */}
              <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider block">Estimated Carbon Release</span>
                  <span className="text-2xl font-black text-white">{result.estimatedCarbonEmissions} <span className="text-sm font-semibold text-white/60">kg CO₂</span></span>
                </div>
                <BarChart2 className="h-10 w-10 text-brand-400 opacity-30" />
              </div>

              {/* Saving tips */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Power Saving Recommendations</h4>
                {result.recommendations?.map((rec, i) => (
                  <div key={i} className="flex items-start space-x-2.5 bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl">
                    <Lightbulb className="h-4 w-4 text-brand-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-white/80 leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzer;
