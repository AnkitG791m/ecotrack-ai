const userRepository = require('../repositories/userRepository');

class LeaderboardService {
  async getLeaderboard(filter = 'all-time') {
    let query = {};
    const now = new Date();

    if (filter === 'daily') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      query = { lastLoginDate: { $gte: startOfDay } };
    } else if (filter === 'weekly') {
      const startOfWeek = new Date();
      startOfWeek.setDate(now.getDate() - 7);
      query = { lastLoginDate: { $gte: startOfWeek } };
    } else if (filter === 'monthly') {
      const startOfMonth = new Date();
      startOfMonth.setDate(now.getDate() - 30);
      query = { lastLoginDate: { $gte: startOfMonth } };
    }

    let users = await userRepository.find(query)
      .select('name email points carbonSaved badges profilePhoto country lastLoginDate')
      .sort({ points: -1 })
      .limit(50);

    if (users.length < 5) {
      users = await userRepository.find({})
        .select('name email points carbonSaved badges profilePhoto country lastLoginDate')
        .sort({ points: -1 })
        .limit(50);
    }

    return users.map((user, index) => ({
      rank: index + 1,
      _id: user._id,
      name: user.name,
      points: user.points,
      carbonSaved: user.carbonSaved,
      badges: user.badges,
      profilePhoto: user.profilePhoto,
      country: user.country
    }));
  }
}

module.exports = new LeaderboardService();
