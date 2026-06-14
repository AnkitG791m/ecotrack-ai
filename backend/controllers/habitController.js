const habitService = require('../services/habitService');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Get all habits for a user (Auto-seed if empty)
 * GET /api/habits
 */
const getHabits = asyncHandler(async (req, res) => {
  const habits = await habitService.getHabits(req.user.id);
  res.json({
    success: true,
    habits
  });
});

/**
 * Toggle habit completion for a specific date (YYYY-MM-DD)
 * POST /api/habits/toggle
 */
const toggleHabit = asyncHandler(async (req, res) => {
  const { habitId, date } = req.body;
  const result = await habitService.toggleHabit(req.user.id, habitId, date);
  res.json({
    success: true,
    ...result
  });
});

module.exports = {
  getHabits,
  toggleHabit
};
