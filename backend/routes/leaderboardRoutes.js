const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/leaderboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=60');
  next();
}, getLeaderboard);

module.exports = router;
