const challengeService = require('../services/challengeService');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Fetch all challenges (Auto-seed if empty)
 * GET /api/challenges
 */
const getChallenges = asyncHandler(async (req, res) => {
  const challenges = await challengeService.getChallenges();
  res.json({
    success: true,
    challenges
  });
});

/**
 * Complete an eco challenge
 * POST /api/challenges/complete/:id
 */
const completeChallenge = asyncHandler(async (req, res) => {
  const result = await challengeService.completeChallenge(req.user.id, req.params.id);
  res.json({
    success: true,
    message: 'Challenge completed! Points awarded.',
    ...result
  });
});

module.exports = {
  getChallenges,
  completeChallenge
};
