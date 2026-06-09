import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calculator, Sparkles, Award, BarChart3, 
  Compass, Trophy, ArrowRight, ShieldCheck, TreePine, Users, Leaf 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    document.title = 'EcoTrack AI - Smart Carbon Footprint Assistant';
  }, []);

  useEffect(() => {
    document.getElementById('main-content')?.focus();
  }, [location]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const features = [
    {
      title: 'Smart Calculator',
      description: 'Audit your weekly transportation, domestic energy, diet, and waste generation in minutes.',
      icon: Calculator,
      color: 'text-brand-400 bg-brand-500/10 border-brand-500/20'
    },
    {
      title: 'Gemini Recommendations',
      description: 'Get deep AI analysis and customized weekly checklists to optimize your green habits.',
      icon: Sparkles,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Daily Challenges',
      description: 'Complete green challenges, maintain daily streaks, and earn points towards level-ups.',
      icon: Award,
      color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    },
    {
      title: 'Carbon Tracking',
      description: 'Visualise your emission curves over time with weekly, monthly, and annual dashboards.',
      icon: BarChart3,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    {
      title: 'Eco Community',
      description: 'Share tips, upvote helpful posts, and connect with like-minded eco advocates.',
      icon: Compass,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    },
    {
      title: 'Global Leaderboard',
      description: 'Compete globally or filter locally. See how your carbon savings rank against the community.',
      icon: Trophy,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/20'
    }
  ];

  return (
    <div className="space-y-20 py-8 relative font-sans">
      {/* Radial Background Accent */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[100px] -z-10" />

      {/* Hero Section */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="text-center max-w-4xl mx-auto space-y-8 pt-12"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-brand-500/10 border border-brand-500/20 px-4 py-1.5 rounded-full text-xs font-semibold text-brand-300">
          <Sparkles className="h-4.5 w-4.5 text-brand-400 animate-pulse" />
          <span>Next-Gen AI Carbon Platform</span>
        </motion.div>

        <motion.h1 
          variants={itemVariants} 
          className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15]"
        >
          Know Your Carbon Footprint. <br />
          <span className="text-gradient-green">Build A Greener Future.</span>
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
        >
          Track weekly emissions, unlock customized AI recommendations, compete in green challenges, and offset your carbon impact today.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            to={user ? "/calculator" : "/register"} 
            className="w-full sm:w-auto glass-button-primary flex items-center justify-center space-x-2 shadow-xl hover:shadow-brand-500/20 hover:scale-[1.02]"
          >
            <span>Calculate Now</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>
          <a 
            href="#features" 
            className="w-full sm:w-auto glass-button-secondary hover:scale-[1.02]"
          >
            Learn More
          </a>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
      >
        {[
          { label: 'Active Eco Members', val: '24,800+', icon: Users, desc: 'Tracking daily emissions' },
          { label: 'Total Carbon Saved', val: '124,500 kg', icon: ShieldCheck, desc: 'CO₂ emissions prevented' },
          { label: 'Forest Trees Equivalent', val: '5,180 Trees', icon: TreePine, desc: 'Annual offset value' }
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6 flex items-center space-x-5 border border-white/[0.05] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-2xl">
              <stat.icon className="h-6 w-6 text-brand-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{stat.val}</p>
              <p className="text-xs font-bold text-white/80 mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{stat.desc}</p>
            </div>
          </div>
        ))}
      </motion.section>

      {/* Features Grid */}
      <section id="features" className="space-y-12 max-w-6xl mx-auto scroll-mt-20">
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold">Platform Capabilities</h2>
          <p className="text-white/50 text-sm sm:text-base max-w-xl mx-auto">
            EcoTrack AI integrates cutting-edge diagnostics with community tools to gamify carbon reduction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div key={idx} className="glass-panel glass-panel-hover p-6 border border-white/[0.04] space-y-4 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className={`p-3 w-fit rounded-xl border ${feat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <feat.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{feat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="space-y-12 max-w-5xl mx-auto">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold">What Eco Warriors Say</h2>
          <p className="text-white/40 text-xs sm:text-sm">Join thousands taking active steps for our biosphere.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              quote: "The carbon calculator opened my eyes! I didn't realize how much my daily air conditioning and driving contributed to my rating. The Gemini recommendations gave me a structured roadmap to cut back.",
              author: "Elena Rostova",
              role: "Environmental Student, Berlin",
              img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100"
            },
            {
              quote: "Completing daily challenges has become a family game. My kids love looking at our streak count and saving water. The community feed keeps us loaded with smart recycling hacks.",
              author: "Marcus Chen",
              role: "Software Architect & Parent, Vancouver",
              img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
            }
          ].map((testi, i) => (
            <div key={i} className="glass-panel p-6 border border-white/[0.04] flex flex-col justify-between space-y-6">
              <p className="text-sm text-white/70 italic leading-relaxed">"{testi.quote}"</p>
              <div className="flex items-center space-x-3.5 border-t border-white/[0.05] pt-4">
                <img src={testi.img} alt={testi.author} className="h-10 w-10 rounded-full object-cover border border-white/10" />
                <div>
                  <h4 className="text-sm font-bold text-white">{testi.author}</h4>
                  <p className="text-[10px] text-white/40">{testi.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] pt-12 pb-6 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-white/40 text-xs text-center md:text-left">
        <div className="flex items-center space-x-2">
          <Leaf className="h-4 w-4 text-brand-400" />
          <span className="font-bold text-white/80">EcoTrack AI</span>
        </div>
        <div>
          <p>© 2026 EcoTrack AI Carbon Footprint Awareness Platform. All rights reserved.</p>
        </div>
        <div className="flex space-x-4">
          <span className="hover:text-white cursor-pointer">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-white cursor-pointer">Terms of Service</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
