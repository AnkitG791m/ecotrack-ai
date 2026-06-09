import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { 
  Shield, Users, Award, FileText, BarChart2, Plus, 
  Trash2, ToggleLeft, ToggleRight, Sparkles, CheckCircle2 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const AdminPanel = () => {
  const { authedFetch } = useAuth();
  const location = useLocation();

  useEffect(() => {
    document.title = 'Admin Panel | EcoTrack AI';
  }, []);

  useEffect(() => {
    document.getElementById('main-content')?.focus();
  }, [location]);
  
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'users', 'challenges', 'posts'
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [challengesList, setChallengesList] = useState([]);
  const [postsList, setPostsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Challenge Form State
  const [chTitle, setChTitle] = useState('');
  const [chDesc, setChDesc] = useState('');
  const [chPoints, setChPoints] = useState(50);
  const [chType, setChType] = useState('other');
  const [chDifficulty, setChDifficulty] = useState('easy');
  const [chLoading, setChLoading] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch analytics
      const alyRes = await authedFetch('/api/admin/analytics');
      const alyData = await alyRes.json();
      if (alyData.success) setAnalytics(alyData.analytics);

      // Fetch users
      const usrRes = await authedFetch('/api/admin/users');
      const usrData = await usrRes.json();
      if (usrData.success) setUsersList(usrData.users);

      // Fetch challenges
      const chRes = await authedFetch('/api/challenges');
      const chData = await chRes.json();
      if (chData.success) setChallengesList(chData.challenges);

      // Fetch posts
      const pstRes = await authedFetch('/api/community/posts');
      const pstData = await pstRes.json();
      if (pstData.success) setPostsList(pstData.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserRole = async (userId) => {
    try {
      const res = await authedFetch(`/api/admin/users/${userId}`, {
        method: 'PUT'
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(prev => prev.map(u => u._id === userId ? { ...u, role: data.user.role } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user profile?')) return;
    try {
      const res = await authedFetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(prev => prev.filter(u => u._id !== userId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    if (!chTitle.trim() || !chDesc.trim()) return;

    setChLoading(true);
    try {
      const res = await authedFetch('/api/admin/challenges', {
        method: 'POST',
        body: {
          title: chTitle,
          description: chDesc,
          points: parseInt(chPoints),
          type: chType,
          difficulty: chDifficulty
        }
      });
      const data = await res.json();
      if (data.success) {
        setChallengesList(prev => [...prev, data.challenge]);
        setChTitle('');
        setChDesc('');
        alert('Eco Challenge successfully created!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChLoading(false);
    }
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (!window.confirm('Delete this challenge?')) return;
    try {
      const res = await authedFetch(`/api/admin/challenges/${challengeId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setChallengesList(prev => prev.filter(c => c._id !== challengeId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post for moderation?')) return;
    try {
      const res = await authedFetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setPostsList(prev => prev.filter(p => p._id !== postId));
      }
    } catch (err) {
      console.error(err);
    }
  };

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
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center space-x-2.5">
          <Shield className="h-7 w-7 text-brand-400" />
          <span>Admin Portal</span>
        </h1>
        <p className="text-sm text-white/50 mt-1">Platform moderation panel, analytics, and content controls.</p>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center space-x-2 bg-white/[0.02] border border-white/[0.06] p-1 rounded-xl w-fit overflow-x-auto">
        {[
          { id: 'analytics', label: 'Analytics', icon: BarChart2 },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'challenges', label: 'Challenges', icon: Award },
          { id: 'posts', label: 'Posts', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === tab.id 
                  ? 'bg-brand-500 text-dark-950 font-bold' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contents */}
      <div className="space-y-6">
        
        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Users', val: analytics.totalUsers, icon: Users, color: 'text-brand-400' },
              { label: 'Active (7d)', val: analytics.activeUsers, icon: CheckCircle2, color: 'text-brand-400' },
              { label: 'Total Carbon Saved', val: `${analytics.totalCarbonSaved} kg`, icon: Sparkles, color: 'text-emerald-400' },
              { label: 'Challenge Rate', val: `${analytics.challengeCompletionRate}%`, icon: Award, color: 'text-emerald-400' }
            ].map((stat, i) => (
              <div key={i} className="glass-panel p-6 border border-white/[0.05] text-center space-y-2">
                <stat.icon className={`h-7 w-7 mx-auto ${stat.color}`} />
                <span className="text-[10px] text-white/40 block font-semibold uppercase">{stat.label}</span>
                <span className="text-2xl font-black block text-white">{stat.val}</span>
              </div>
            ))}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Registered Accounts</h3>
            <div className="space-y-2.5">
              {usersList.map(usr => (
                <div key={usr._id} className="glass-panel p-4 border border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <img src={usr.profilePhoto} alt={usr.name} className="h-9 w-9 rounded-full object-cover border border-white/10" />
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">{usr.name}</h4>
                      <p className="text-[10px] text-white/40 leading-none mt-1">{usr.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 justify-between sm:justify-end border-t sm:border-0 border-white/[0.04] pt-2.5 sm:pt-0 mt-2 sm:mt-0">
                    <div className="text-left sm:text-right space-y-0.5">
                      <span className="text-[9px] bg-brand-500/10 border border-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full font-bold uppercase">{usr.role}</span>
                      <span className="text-[10px] text-white/40 block font-semibold mt-1">{usr.points} XP</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleUserRole(usr._id)}
                        className="p-1.5 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] rounded-xl text-white/70 hover:text-white transition-all"
                        title="Toggle Admin Role"
                      >
                        {usr.role === 'admin' ? <ToggleRight className="h-4.5 w-4.5 text-brand-400" /> : <ToggleLeft className="h-4.5 w-4.5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(usr._id)}
                        className="p-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-red-400 transition-all"
                        title="Delete User"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHALLENGES TAB */}
        {activeTab === 'challenges' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Create challenge form */}
            <div className="lg:col-span-1">
              <GlassCard className="border-white/[0.08] p-5 space-y-4" hoverable={false}>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Plus className="h-4 w-4" />
                  <span>Create Daily Challenge</span>
                </h3>

                <form onSubmit={handleCreateChallenge} className="space-y-3">
                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="Challenge Title"
                      value={chTitle}
                      onChange={(e) => setChTitle(e.target.value)}
                      className="glass-input text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <textarea
                      placeholder="Task description detail..."
                      value={chDesc}
                      onChange={(e) => setChDesc(e.target.value)}
                      rows={3}
                      className="glass-input text-xs resize-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <input
                        type="number"
                        placeholder="XP Points"
                        value={chPoints}
                        onChange={(e) => setChPoints(e.target.value)}
                        className="glass-input text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <select
                        value={chDifficulty}
                        onChange={(e) => setChDifficulty(e.target.value)}
                        className="glass-input text-xs text-white bg-dark-900"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <select
                      value={chType}
                      onChange={(e) => setChType(e.target.value)}
                      className="glass-input text-xs text-white bg-dark-900"
                    >
                      <option value="other">Other Category</option>
                      <option value="water">Water</option>
                      <option value="plastic">Plastic</option>
                      <option value="transport">Transport</option>
                      <option value="energy">Energy</option>
                      <option value="food">Diet & Food</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={chLoading}
                    className="w-full glass-button-primary text-xs font-bold mt-2"
                  >
                    {chLoading ? 'Creating...' : 'Publish Challenge'}
                  </button>
                </form>
              </GlassCard>
            </div>

            {/* List active challenges */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Active Challenges</h3>
              
              <div className="space-y-2.5">
                {challengesList.map(ch => (
                  <div key={ch._id} className="glass-panel p-4 border border-white/[0.05] flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white">{ch.title}</h4>
                      <p className="text-[10px] text-white/50 leading-relaxed">{ch.description}</p>
                    </div>
                    <div className="flex items-center space-x-3.5 flex-shrink-0 ml-4">
                      <span className="text-[9px] bg-brand-500/10 border border-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full font-bold">
                        +{ch.points} XP
                      </span>
                      <button
                        onClick={() => handleDeleteChallenge(ch._id)}
                        className="p-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-red-400 transition-all"
                        title="Delete Challenge"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* POSTS MODERATION TAB */}
        {activeTab === 'posts' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-medium">Community Post Moderation</h3>
            
            <div className="space-y-2.5">
              {postsList.map(pst => (
                <div key={pst._id} className="glass-panel p-4 border border-white/[0.05] flex items-center justify-between gap-4">
                  <div className="space-y-1.5 truncate">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white truncate">{pst.title}</span>
                      <span className="text-[9px] text-white/30 truncate">by {pst.user?.name || 'unknown'}</span>
                    </div>
                    <p className="text-[10px] text-white/50 leading-normal truncate">{pst.content}</p>
                  </div>

                  <div className="flex items-center space-x-4 flex-shrink-0">
                    <span className="text-[9px] bg-white/[0.03] border border-white/[0.06] text-white/40 px-2.5 py-0.5 rounded-full">
                      Likes: {pst.likes?.length || 0}
                    </span>
                    <button
                      onClick={() => handleDeletePost(pst._id)}
                      className="p-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-red-400 transition-all"
                      title="Remove Post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {postsList.length === 0 && (
                <div className="text-center py-12 text-white/40 text-xs">No community posts active.</div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;
