const leaderboardService = require('../services/leaderboardService');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Get Leaderboard Rankings
 * GET /api/leaderboard
 */
const getLeaderboard = asyncHandler(async (req, res) => {
  const { filter = 'all-time' } = req.query;
  const leaderboard = await leaderboardService.getLeaderboard(filter);
  res.json({
    success: true,
    leaderboard
  });
});

module.exports = {
  getLeaderboard
};
