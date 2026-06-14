const adminService = require('../services/adminService');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Fetch platform analytics
 * GET /api/admin/analytics
 */
const getPlatformAnalytics = asyncHandler(async (req, res) => {
  const analytics = await adminService.getPlatformAnalytics();
  res.json({
    success: true,
    analytics
  });
});

/**
 * List all users
 * GET /api/admin/users
 */
const getUsers = asyncHandler(async (req, res) => {
  const users = await adminService.getUsers();
  res.json({
    success: true,
    users
  });
});

/**
 * Toggle User Role
 * PUT /api/admin/users/:id
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const user = await adminService.updateUserRole(req.params.id);
  res.json({
    success: true,
    message: `User role updated successfully`,
    user
  });
});

/**
 * Delete User
 * DELETE /api/admin/users/:id
 */
const deleteUser = asyncHandler(async (req, res) => {
  await adminService.deleteUser(req.params.id);
  res.json({
    success: true,
    message: 'User successfully deleted'
  });
});

/**
 * Create Challenge
 * POST /api/admin/challenges
 */
const createChallenge = asyncHandler(async (req, res) => {
  const challenge = await adminService.createChallenge(req.body);
  res.status(201).json({
    success: true,
    challenge
  });
});

/**
 * Delete Challenge
 * DELETE /api/admin/challenges/:id
 */
const deleteChallenge = asyncHandler(async (req, res) => {
  await adminService.deleteChallenge(req.params.id);
  res.json({
    success: true,
    message: 'Challenge deleted successfully'
  });
});

/**
 * Delete Post (moderation)
 * DELETE /api/admin/posts/:id
 */
const deletePost = asyncHandler(async (req, res) => {
  await adminService.deletePost(req.params.id);
  res.json({
    success: true,
    message: 'Post removed successfully'
  });
});

module.exports = {
  getPlatformAnalytics,
  getUsers,
  updateUserRole,
  deleteUser,
  createChallenge,
  deleteChallenge,
  deletePost
};
