const communityService = require('../services/communityService');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Create a new community post
 * POST /api/community/posts
 */
const createPost = asyncHandler(async (req, res) => {
  const result = await communityService.createPost(req.user.id, req.body);
  res.status(201).json({
    success: true,
    ...result
  });
});

/**
 * Fetch posts (with filtering/sorting)
 * GET /api/community/posts
 */
const getPosts = asyncHandler(async (req, res) => {
  const { sort = 'newest' } = req.query;
  const posts = await communityService.getPosts(sort);
  res.json({
    success: true,
    posts
  });
});

/**
 * Like / Upvote a post
 * POST /api/community/posts/like/:id
 */
const likePost = asyncHandler(async (req, res) => {
  const result = await communityService.likePost(req.user.id, req.params.id);
  res.json({
    success: true,
    ...result
  });
});

/**
 * Create comment on a post
 * POST /api/community/comments/:postId
 */
const createComment = asyncHandler(async (req, res) => {
  const result = await communityService.createComment(req.user.id, req.params.postId, req.body.content);
  res.status(201).json({
    success: true,
    ...result
  });
});

/**
 * Get comments for a post
 * GET /api/community/comments/:postId
 */
const getPostComments = asyncHandler(async (req, res) => {
  const comments = await communityService.getPostComments(req.params.postId);
  res.json({
    success: true,
    comments
  });
});

/**
 * Get community statistics & sidebars
 * GET /api/community/sidebar
 */
const getCommunitySidebar = asyncHandler(async (req, res) => {
  const result = await communityService.getCommunitySidebar();
  res.json({
    success: true,
    ...result
  });
});

module.exports = {
  createPost,
  getPosts,
  likePost,
  createComment,
  getPostComments,
  getCommunitySidebar
};
