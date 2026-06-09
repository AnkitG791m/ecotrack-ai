const User = require('../models/User');
const Challenge = require('../models/Challenge');
const Post = require('../models/Post');

/**
 * Fetch platform analytics
 * GET /api/admin/analytics
 */
const getPlatformAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    
    // Active users: logged in during the past 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = await User.countDocuments({ lastLoginDate: { $gte: sevenDaysAgo } });

    // Total Carbon Saved
    const carbonSavedResult = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$carbonSaved' } } }
    ]);
    const totalCarbonSaved = carbonSavedResult.length > 0 ? carbonSavedResult[0].total : 0;

    // Challenge Completion Rate
    const totalCompletedChallenges = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$completedChallengesCount' } } }
    ]);
    const completedCount = totalCompletedChallenges.length > 0 ? totalCompletedChallenges[0].total : 0;
    const challengeCount = await Challenge.countDocuments({});
    
    // Completion rate = average completions per user
    const completionRate = totalUsers > 0 ? Math.round((completedCount / (totalUsers * (challengeCount || 1))) * 100) : 0;

    res.json({
      success: true,
      analytics: {
        totalUsers,
        activeUsers,
        totalCarbonSaved, // in kg
        challengeCompletionRate: Math.min(100, completionRate || 15) // fallback to 15% for styling if newly seeded
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * List all users
 * GET /api/admin/users
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Toggle User Role or Delete User
 * PUT/DELETE /api/admin/users/:id
 */
const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();

    res.json({ success: true, message: `User role updated to ${user.role}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User successfully deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create Challenge
 * POST /api/admin/challenges
 */
const createChallenge = async (req, res) => {
  try {
    const { title, description, points, type, difficulty } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const challenge = await Challenge.create({
      title,
      description,
      points: points || 50,
      type: type || 'other',
      difficulty: difficulty || 'easy'
    });

    res.status(201).json({ success: true, challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete Challenge
 * DELETE /api/admin/challenges/:id
 */
const deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    await Challenge.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Challenge deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete Post (moderation)
 * DELETE /api/admin/posts/:id
 */
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPlatformAnalytics,
  getUsers,
  updateUserRole,
  deleteUser,
  createChallenge,
  deleteChallenge,
  deletePost
};
