import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { 
  Compass, Heart, MessageSquare, Plus, Send, AlertTriangle, 
  TrendingUp, Sparkles, User as UserIcon, Tag, Clock
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Community = () => {
  const { user, token, authedFetch, refreshUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    document.title = 'Community Feed | EcoTrack AI';
  }, []);

  useEffect(() => {
    document.getElementById('main-content')?.focus();
  }, [location]);
  
  const [posts, setPosts] = useState([]);
  const [sidebarData, setSidebarData] = useState({ helpfulUsers: [], trendingTags: [] });
  const [loading, setLoading] = useState(true);

  // Post Creator State
  const [showCreator, setShowCreator] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  
  // Comment Section State (tracks active post comments drawer)
  const [activePostComments, setActivePostComments] = useState(null); // post ID
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchCommunityData = async () => {
    try {
      const postsRes = await authedFetch('/api/community/posts');
      const postsData = await postsRes.json();
      if (postsData.success) {
        setPosts(postsData.posts);
      }

      const sidebarRes = await authedFetch('/api/community/sidebar');
      const sidebarData = await sidebarRes.json();
      if (sidebarData.success) {
        setSidebarData(sidebarData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const handleLike = async (postId) => {
    try {
      const res = await authedFetch(`/api/community/posts/like/${postId}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setPosts(prev => prev.map(p => {
          if (p._id === postId) {
            return {
              ...p,
              upvotes: data.upvotes,
              likes: data.isLiked 
                ? [...p.likes, user._id] 
                : p.likes.filter(id => id !== user._id)
            };
          }
          return p;
        }));
        refreshUser();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setCreateLoading(true);
    const tagsArr = newTags.split(',').map(t => t.trim().toLowerCase()).filter(t => t !== '');
    
    try {
      const res = await authedFetch('/api/community/posts', {
        method: 'POST',
        body: {
          title: newTitle,
          content: newContent,
          tags: tagsArr
        }
      });
      const data = await res.json();
      if (data.success) {
        setPosts(prev => [data.post, ...prev]);
        setNewTitle('');
        setNewContent('');
        setNewTags('');
        setShowCreator(false);
        refreshUser();
        // Refresh sidebar tags
        const sidebarRes = await authedFetch('/api/community/sidebar');
        const sidebarData = await sidebarRes.json();
        if (sidebarData.success) setSidebarData(sidebarData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpenComments = async (postId) => {
    if (activePostComments === postId) {
      setActivePostComments(null);
      setComments([]);
      return;
    }

    setActivePostComments(postId);
    setComments([]);
    try {
      const res = await authedFetch(`/api/community/comments/${postId}`);
      const data = await res.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || !activePostComments) return;

    setCommentLoading(true);
    try {
      const res = await authedFetch(`/api/community/comments/${activePostComments}`, {
        method: 'POST',
        body: { content: commentInput }
      });
      const data = await res.json();
      if (data.success) {
        setComments(prev => [...prev, data.comment]);
        setCommentInput('');
        // Update commentsCount in the posts list
        setPosts(prev => prev.map(p => {
          if (p._id === activePostComments) {
            return { ...p, commentsCount: data.commentsCount };
          }
          return p;
        }));
        refreshUser();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCommentLoading(false);
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12 font-sans">
      
      {/* Main Feed Column */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Feed Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center space-x-2">
              <Compass className="h-7 w-7 text-brand-400" />
              <span>Eco Community</span>
            </h1>
            <p className="text-sm text-white/50 mt-1 font-medium">Share eco tips and vote on helpful sustainability advice.</p>
          </div>
          
          <button
            onClick={() => setShowCreator(!showCreator)}
            className="glass-button-primary !py-2.5 !px-4 text-xs font-bold flex items-center space-x-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Share Eco Tip</span>
          </button>
        </div>

        {/* Create Post Form Card */}
        {showCreator && (
          <GlassCard className="border-brand-500/10 p-5 space-y-4 relative" hoverable={false}>
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-brand-400 to-emerald-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Share your green tip</h3>
            
            <form onSubmit={handleCreatePost} className="space-y-3">
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Title (e.g. Smart Composting for apartments)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="glass-input text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <textarea
                  placeholder="Share details. What works? What are the benefits?"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  className="glass-input text-xs resize-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Tags (comma-separated, e.g. recycling, composting, zero-waste)"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreator(false)}
                  className="glass-button-secondary !py-2 !px-4 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="glass-button-primary !py-2 !px-4 text-xs font-bold"
                >
                  {createLoading ? 'Posting...' : 'Share Tip (+20 XP)'}
                </button>
              </div>
            </form>
          </GlassCard>
        )}

        {/* Posts feed */}
        <div className="space-y-4">
          {posts.map((post) => {
            const hasLiked = post.likes.includes(user._id);
            const isCommentsOpen = activePostComments === post._id;

            return (
              <GlassCard key={post._id} className="border-white/[0.06] p-5 space-y-4" hoverable={false}>
                
                {/* Author row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={post.user?.profilePhoto}
                      alt={post.user?.name}
                      className="h-8 w-8 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center space-x-1">
                        <span>{post.user?.name}</span>
                        <span className="text-[9px] bg-brand-500/15 text-brand-300 px-1.5 py-0.5 rounded font-bold uppercase ml-1">
                          {post.user?.points} XP
                        </span>
                      </h4>
                      <div className="flex items-center space-x-1.5 text-[9px] text-white/40 mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white">{post.title}</h3>
                  <p className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] bg-white/[0.03] border border-white/[0.06] text-white/50 px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <Tag className="h-2.5 w-2.5 text-brand-400" />
                        <span>{t}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions (Like, Comment counts) */}
                <div className="flex items-center space-x-4 border-t border-white/[0.04] pt-3 text-xs">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center space-x-1.5 font-bold transition-colors ${
                      hasLiked ? 'text-red-400' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${hasLiked ? 'fill-red-400' : ''}`} />
                    <span>{post.upvotes} Helpful</span>
                  </button>

                  <button
                    onClick={() => handleOpenComments(post._id)}
                    className={`flex items-center space-x-1.5 font-bold transition-colors ${
                      isCommentsOpen ? 'text-brand-400' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.commentsCount} Comments</span>
                  </button>
                </div>

                {/* Comments Drawer panel */}
                {isCommentsOpen && (
                  <div className="mt-4 pt-4 border-t border-white/[0.04] space-y-4 animate-fadeIn">
                    
                    {/* Add comment form */}
                    <form onSubmit={handleAddComment} className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Write a reply..."
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500/40 text-white placeholder-white/30"
                      />
                      <button
                        type="submit"
                        disabled={commentLoading || !commentInput.trim()}
                        className="glass-button-primary !py-2 !px-3.5 text-xs flex items-center justify-center"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                      {comments.map((comm) => (
                        <div key={comm._id} className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl flex items-start space-x-3">
                          <img
                            src={comm.user?.profilePhoto}
                            alt={comm.user?.name}
                            className="h-6 w-6 rounded-full object-cover border border-white/10 mt-0.5"
                          />
                          <div className="space-y-0.5 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-white">{comm.user?.name}</span>
                              <span className="text-[9px] text-white/30">{new Date(comm.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[11px] text-white/70 leading-relaxed">{comm.content}</p>
                          </div>
                        </div>
                      ))}
                      {comments.length === 0 && (
                        <p className="text-center py-2 text-[10px] text-white/30 italic">No comments yet. Write a friendly reply above!</p>
                      )}
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Sidebar Columns (Helpful users, tags) */}
      <div className="space-y-6">
        
        {/* Most Helpful Users */}
        <GlassCard className="border-white/[0.08]" hoverable={false}>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-1.5">
            <Sparkles className="h-4.5 w-4.5 text-brand-400" />
            <span>Top Contributors</span>
          </h3>

          <div className="space-y-3">
            {sidebarData.helpfulUsers?.map((hlp, idx) => (
              <div key={hlp._id} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                <div className="flex items-center space-x-2.5">
                  <span className="text-xs font-black text-white/40 w-4 text-center">{idx + 1}</span>
                  <img src={hlp.profilePhoto} alt={hlp.name} className="h-7 w-7 rounded-full object-cover border border-white/10" />
                  <span className="text-xs font-bold text-white/90 truncate max-w-[100px]">{hlp.name}</span>
                </div>
                <span className="text-[10px] bg-brand-500/10 border border-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full font-bold">
                  {hlp.points} XP
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Trending Tags */}
        <GlassCard className="border-white/[0.08]" hoverable={false}>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-1.5">
            <TrendingUp className="h-4.5 w-4.5 text-brand-400" />
            <span>Trending Topics</span>
          </h3>

          <div className="flex flex-wrap gap-1.5">
            {sidebarData.trendingTags?.map((item, idx) => (
              <span key={idx} className="text-xs bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-brand-500/20 text-white/70 px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center space-x-1">
                <Tag className="h-3 w-3 text-brand-400" />
                <span>{item.tag}</span>
                <span className="text-[10px] text-white/30 font-bold">({item.count})</span>
              </span>
            ))}
            {sidebarData.trendingTags?.length === 0 && (
              <span className="text-xs text-white/30 italic">No tags shared yet.</span>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Community;
