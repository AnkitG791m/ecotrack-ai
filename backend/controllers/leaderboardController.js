const User = require('../models/User');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Get Leaderboard Rankings
 * GET /api/leaderboard
 */
const getLeaderboard = async (req, res) => {
  try {
    const { filter = 'all-time' } = req.query; // 'daily', 'weekly', 'monthly', 'all-time'
    
    let query = {};
    
    // For a hackathon or simulation, we can query users active in different ranges:
    const now = new Date();
    if (filter === 'daily') {
      // Users active today
      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);
      query = { lastLoginDate: { $gte: startOfDay } };
    } else if (filter === 'weekly') {
      // Users active this week
      const startOfWeek = new Date();
      startOfWeek.setDate(now.getDate() - 7);
      query = { lastLoginDate: { $gte: startOfWeek } };
    } else if (filter === 'monthly') {
      // Users active this month
      const startOfMonth = new Date();
      startOfMonth.setDate(now.getDate() - 30);
      query = { lastLoginDate: { $gte: startOfMonth } };
    }

    // Query top users by points
    let users = await User.find(query)
      .select('name email points carbonSaved badges profilePhoto country lastLoginDate')
      .sort({ points: -1 })
      .limit(50);

    // If query returned few users because it's a new database, fallback to all users
    if (users.length < 5) {
      users = await User.find({})
        .select('name email points carbonSaved badges profilePhoto country lastLoginDate')
        .sort({ points: -1 })
        .limit(50);
    }

    // Map ranks
    const rankedUsers = users.map((user, index) => ({
      rank: index + 1,
      _id: user._id,
      name: user.name,
      points: user.points,
      carbonSaved: user.carbonSaved,
      badges: user.badges,
      profilePhoto: user.profilePhoto,
      country: user.country
    }));

    res.json({ success: true, leaderboard: rankedUsers });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ success: false, message: error.message });
  }
};

module.exports = {
  getLeaderboard
};
