import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Car, Zap, Carrot, Trash2, ArrowLeft, ArrowRight, Check, 
  Leaf, Info, Sparkles, RefreshCw, BarChart2, ShieldAlert
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import CalculatorResults from '../components/CalculatorResults';

const Calculator = () => {
  const { authedFetch, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = 'Calculator | EcoTrack AI';
  }, []);

  useEffect(() => {
    document.getElementById('main-content')?.focus();
  }, [location]);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    carKm: '',
    bikeKm: '',
    publicTransportKm: '',
    flightsPerYear: '',
    electricityUnits: '',
    acHours: '',
    appliancesUsage: 'medium',
    diet: 'mixed',
    plasticUsage: 'medium',
    recyclingHabits: 'some',
    garbageGeneration: 'medium'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [pointsEarned, setPointsEarned] = useState(0);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await authedFetch('/api/calculator/calculate', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.report);
        setPointsEarned(data.pointsEarned);
        refreshUser();
      } else {
        alert(data.message || 'Calculation failed.');
      }
    } catch (err) {
      alert('Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  const resetCalculator = () => {
    setResult(null);
    setStep(1);
    setFormData({
      carKm: '',
      bikeKm: '',
      publicTransportKm: '',
      flightsPerYear: '',
      electricityUnits: '',
      acHours: '',
      appliancesUsage: 'medium',
      diet: 'mixed',
      plasticUsage: 'medium',
      recyclingHabits: 'some',
      garbageGeneration: 'medium'
    });
  };

  const getZoneDetails = (category = '') => {
    const cat = category.toLowerCase();
    if (cat === 'green') {
      return {
        title: 'Green Zone',
        color: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
        desc: 'Eco Eco-Friendly: Your carbon footprint is well within sustainable boundaries (< 3.5 tons/year). Great job!',
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

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Carbon Calculator</h1>
        <p className="text-sm text-white/50">Audit your weekly and monthly lifestyle habits to calculate your CO₂ footprint.</p>
      </div>

      {!result ? (
        /* Calculator Steps */
        <GlassCard className="border-white/[0.08] relative overflow-hidden" hoverable={false}>
          {/* Progress Bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-white/[0.04]">
            <div 
              className="h-full bg-brand-500 transition-all duration-500" 
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          {/* Steps Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-brand-400">STEP {step} OF 4</span>
              <span className="text-xs text-white/30">•</span>
              <span className="text-xs text-white/60 font-semibold uppercase tracking-wider">
                {step === 1 && 'Transportation'}
                {step === 2 && 'Household Energy'}
                {step === 3 && 'Dietary Habits'}
                {step === 4 && 'Waste & Recycling'}
              </span>
            </div>
          </div>

          {/* Form Content */}
          <div className="min-h-[220px] py-2">
            
            {/* STEP 1: TRANSPORTATION */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/60 font-semibold flex items-center space-x-1">
                      <Car className="h-3.5 w-3.5 text-brand-400" />
                      <span>Car Travel (km / week)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.carKm}
                      onChange={(e) => handleInputChange('carKm', e.target.value)}
                      placeholder="e.g. 120"
                      className="glass-input text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/60 font-semibold flex items-center space-x-1">
                      <Leaf className="h-3.5 w-3.5 text-brand-400" />
                      <span>Bicycle / Walking (km / week)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.bikeKm}
                      onChange={(e) => handleInputChange('bikeKm', e.target.value)}
                      placeholder="e.g. 15"
                      className="glass-input text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/60 font-semibold flex items-center space-x-1">
                      <Car className="h-3.5 w-3.5 text-brand-400" />
                      <span>Public Transport (km / week)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.publicTransportKm}
                      onChange={(e) => handleInputChange('publicTransportKm', e.target.value)}
                      placeholder="e.g. 60"
                      className="glass-input text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/60 font-semibold flex items-center space-x-1">
                      <BarChart2 className="h-3.5 w-3.5 text-brand-400" />
                      <span>Flights Taken (flights / year)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.flightsPerYear}
                      onChange={(e) => handleInputChange('flightsPerYear', e.target.value)}
                      placeholder="e.g. 2"
                      className="glass-input text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ENERGY */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/60 font-semibold flex items-center space-x-1">
                      <Zap className="h-3.5 w-3.5 text-brand-400" />
                      <span>Electricity Consumption (kWh / month)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.electricityUnits}
                      onChange={(e) => handleInputChange('electricityUnits', e.target.value)}
                      placeholder="e.g. 220"
                      className="glass-input text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/60 font-semibold flex items-center space-x-1">
                      <Zap className="h-3.5 w-3.5 text-brand-400" />
                      <span>Air Conditioning Usage (hours / day)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.acHours}
                      onChange={(e) => handleInputChange('acHours', e.target.value)}
                      placeholder="e.g. 4"
                      className="glass-input text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-white/60 font-semibold block">Home Appliances Scale</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['low', 'medium', 'high'].map(scale => (
                      <button
                        key={scale}
                        type="button"
                        onClick={() => handleInputChange('appliancesUsage', scale)}
                        className={`py-3 rounded-xl border text-xs font-semibold uppercase transition-all ${
                          formData.appliancesUsage === scale
                            ? 'bg-brand-500 border-brand-500 text-dark-950 font-bold'
                            : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] text-white/80'
                        }`}
                      >
                        {scale}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: FOOD */}
            {step === 3 && (
              <div className="space-y-4">
                <label className="text-xs text-white/60 font-semibold block">Dietary Profile</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'vegetarian', title: 'Vegetarian / Vegan', desc: 'Fully plant-based, dairy, or egg meals. Lowest agricultural emissions.' },
                    { id: 'mixed', title: 'Mixed Diet', desc: 'Average balanced consumption of fresh greens, grains, poultry, and occasional red meat.' },
                    { id: 'non-vegetarian', title: 'Meat-Heavy', desc: 'Frequent red meat, beef, pork, or lamb consumption. Higher methane & transport footprint.' }
                  ].map(dietOpt => (
                    <button
                      key={dietOpt.id}
                      type="button"
                      onClick={() => handleInputChange('diet', dietOpt.id)}
                      className={`p-4 rounded-xl border text-left transition-all flex items-start space-x-3.5 ${
                        formData.diet === dietOpt.id
                          ? 'bg-brand-500/10 border-brand-500/40 text-white'
                          : 'bg-white/[0.01] border-white/[0.06] hover:bg-white/[0.03] text-white/80'
                      }`}
                    >
                      <div className={`p-2 rounded-lg mt-0.5 border ${
                        formData.diet === dietOpt.id ? 'bg-brand-500 text-dark-950 border-brand-500' : 'bg-white/[0.02] border-white/5'
                      }`}>
                        <Carrot className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold">{dietOpt.title}</h4>
                        <p className="text-[10px] text-white/50 mt-0.5 leading-relaxed">{dietOpt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: WASTE */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Plastic usage scale */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/60 font-semibold">Plastic Usage (Packaging/Bottles)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['low', 'medium', 'high'].map(scale => (
                        <button
                          key={scale}
                          type="button"
                          onClick={() => handleInputChange('plasticUsage', scale)}
                          className={`py-2.5 rounded-xl border text-[10px] font-semibold uppercase transition-all ${
                            formData.plasticUsage === scale
                              ? 'bg-brand-500 border-brand-500 text-dark-950 font-bold'
                              : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] text-white/85'
                          }`}
                        >
                          {scale}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Garbage volume scale */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/60 font-semibold">Garbage Generation (Trash volume)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['low', 'medium', 'high'].map(scale => (
                        <button
                          key={scale}
                          type="button"
                          onClick={() => handleInputChange('garbageGeneration', scale)}
                          className={`py-2.5 rounded-xl border text-[10px] font-semibold uppercase transition-all ${
                            formData.garbageGeneration === scale
                              ? 'bg-brand-500 border-brand-500 text-dark-950 font-bold'
                              : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] text-white/85'
                          }`}
                        >
                          {scale}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recycling Habits */}
                <div className="space-y-1.5">
                  <label className="text-xs text-white/60 font-semibold">How much of your waste is recycled?</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'all', label: 'All of it' },
                      { id: 'some', label: 'Some parts' },
                      { id: 'none', label: 'None' }
                    ].map(recOpt => (
                      <button
                        key={recOpt.id}
                        type="button"
                        onClick={() => handleInputChange('recyclingHabits', recOpt.id)}
                        className={`py-3 rounded-xl border text-xs font-semibold transition-all ${
                          formData.recyclingHabits === recOpt.id
                            ? 'bg-brand-500 border-brand-500 text-dark-950 font-bold'
                            : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] text-white/80'
                        }`}
                      >
                        {recOpt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Form Actions footer */}
          <div className="flex items-center justify-between border-t border-white/[0.06] pt-5 mt-6">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="glass-button-secondary !px-4 !py-2.5 text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
            
            {step === 4 ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="glass-button-primary !px-5 !py-2.5 text-xs font-bold flex items-center space-x-1.5"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Calculating...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Calculate</span>
                    <Check className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="glass-button-primary !px-5 !py-2.5 text-xs font-bold flex items-center space-x-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </GlassCard>
      ) : (
        <CalculatorResults
          result={result}
          pointsEarned={pointsEarned}
          resetCalculator={resetCalculator}
          navigate={navigate}
        />
      )}
    </div>
  );
};

export default Calculator;
