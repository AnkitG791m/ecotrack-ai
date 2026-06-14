const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Create a new community post
 * POST /api/community/posts
 */
const createPost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Title and content are required' });
    }

    const post = await Post.create({
      user: req.user.id,
      title,
      content,
      tags: tags || []
    });

    // Reward user for sharing tips (+20 points)
    const user = await User.findById(req.user.id);
    user.points += 20;
    await user.save();

    const populatedPost = await Post.findById(post._id).populate('user', 'name profilePhoto points');

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      post: populatedPost,
      pointsEarned: 20
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ success: false, message: error.message });
  }
};

/**
 * Fetch posts (with filtering/sorting)
 * GET /api/community/posts
 */
const getPosts = async (req, res) => {
  try {
    const { sort = 'newest' } = req.query; // 'newest', 'trending'
    
    let sortQuery = { createdAt: -1 };
    if (sort === 'trending') {
      sortQuery = { upvotes: -1, createdAt: -1 };
    }

    const posts = await Post.find({})
      .populate('user', 'name profilePhoto points')
      .sort(sortQuery);

    res.json({ success: true, posts });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ success: false, message: error.message });
  }
};

/**
 * Like / Upvote a post
 * POST /api/community/posts/like/:id
 */
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Post not found' });
    }

    const index = post.likes.indexOf(req.user.id);
    let isLiked = false;

    if (index === -1) {
      // Like post
      post.likes.push(req.user.id);
      post.upvotes += 1;
      isLiked = true;

      // Reward post author (+5 points for a helpful tip!)
      const author = await User.findById(post.user);
      if (author && author._id.toString() !== req.user.id) {
        author.points += 5;
        await author.save();
      }
    } else {
      // Unlike post
      post.likes.splice(index, 1);
      post.upvotes = Math.max(0, post.upvotes - 1);
      isLiked = false;
    }

    await post.save();

    res.json({ success: true, upvotes: post.upvotes, isLiked });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ success: false, message: error.message });
  }
};

/**
 * Create comment on a post
 * POST /api/community/comments/:postId
 */
const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Comment content is required' });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Post not found' });
    }

    const comment = await Comment.create({
      post: post._id,
      user: req.user.id,
      content
    });

    // Update comment count
    post.commentsCount += 1;
    await post.save();

    // Reward user for engagement (+2 points)
    const user = await User.findById(req.user.id);
    user.points += 2;
    await user.save();

    const populatedComment = await Comment.findById(comment._id).populate('user', 'name profilePhoto');

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      comment: populatedComment,
      commentsCount: post.commentsCount
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ success: false, message: error.message });
  }
};

/**
 * Get comments for a post
 * GET /api/community/comments/:postId
 */
const getPostComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('user', 'name profilePhoto')
      .sort({ createdAt: 1 });

    res.json({ success: true, comments });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ success: false, message: error.message });
  }
};

/**
 * Get community statistics & sidebars
 * GET /api/community/sidebar
 */
const getCommunitySidebar = async (req, res) => {
  try {
    // Top 5 helpful users (highest points)
    const helpfulUsers = await User.find({})
      .select('name profilePhoto points')
      .sort({ points: -1 })
      .limit(5);

    // Common tags (simple group check)
    const posts = await Post.find({}).select('tags');
    const tagCounts = {};
    posts.forEach(p => {
      p.tags.forEach(t => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });

    const trendingTags = Object.keys(tagCounts)
      .map(tag => ({ tag, count: tagCounts[tag] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      success: true,
      helpfulUsers,
      trendingTags
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  likePost,
  createComment,
  getPostComments,
  getCommunitySidebar
};
