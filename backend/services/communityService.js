const ValidationError = require('../utils/errors/ValidationError');
const NotFoundError = require('../utils/errors/NotFoundError');
const PostDTO = require('../dto/PostDTO');
const CommentDTO = require('../dto/CommentDTO');

class CommunityService {
  constructor(postRepository, commentRepository, userRepository, logger) {
    this.postRepository = postRepository;
    this.commentRepository = commentRepository;
    this.userRepository = userRepository;
    this.logger = logger;
  }

  async createPost(userId, postData) {
    const { title, content, tags } = postData;
    if (!title || !content) {
      throw new ValidationError('Title and content are required');
    }

    const post = await this.postRepository.create({
      user: userId,
      title,
      content,
      tags: tags || []
    });

    // Reward user for sharing tips (+20 points)
    const user = await this.userRepository.findById(userId);
    if (user) {
      user.points += 20;
      await this.userRepository.save(user);
    }

    const populatedPost = await this.postRepository.findById(post._id).populate('user', 'name profilePhoto points');

    this.logger.info(`Community post created by user: ${userId}`);

    return {
      post: PostDTO.fromEntity(populatedPost),
      pointsEarned: 20
    };
  }

  async getPosts(sort = 'newest') {
    let sortQuery = { createdAt: -1 };
    if (sort === 'trending') {
      sortQuery = { upvotes: -1, createdAt: -1 };
    }

    const posts = await this.postRepository.find({})
      .populate('user', 'name profilePhoto points')
      .sort(sortQuery);

    return PostDTO.fromEntities(posts);
  }

  async likePost(userId, postId) {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const index = post.likes.indexOf(userId);
    let isLiked = false;

    if (index === -1) {
      // Like post
      post.likes.push(userId);
      post.upvotes += 1;
      isLiked = true;

      // Reward post author (+5 points for a helpful tip!)
      const author = await this.userRepository.findById(post.user);
      if (author && author._id.toString() !== userId) {
        author.points += 5;
        await this.userRepository.save(author);
      }
    } else {
      // Unlike post
      post.likes.splice(index, 1);
      post.upvotes = Math.max(0, post.upvotes - 1);
      isLiked = false;
    }

    await this.postRepository.save(post);

    this.logger.info(`Post ${postId} liked/unliked by user: ${userId}`);

    return {
      upvotes: post.upvotes,
      isLiked
    };
  }

  async createComment(userId, postId, content) {
    if (!content) {
      throw new ValidationError('Comment content is required');
    }

    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const comment = await this.commentRepository.create({
      post: post._id,
      user: userId,
      content
    });

    // Update comment count
    post.commentsCount += 1;
    await this.postRepository.save(post);

    // Reward user for engagement (+2 points)
    const user = await this.userRepository.findById(userId);
    if (user) {
      user.points += 2;
      await this.userRepository.save(user);
    }

    const populatedComment = await this.commentRepository.findById(comment._id).populate('user', 'name profilePhoto');

    this.logger.info(`Comment created by user ${userId} on post ${postId}`);

    return {
      comment: CommentDTO.fromEntity(populatedComment),
      commentsCount: post.commentsCount
    };
  }

  async getPostComments(postId) {
    const comments = await this.commentRepository.find({ post: postId })
      .populate('user', 'name profilePhoto')
      .sort({ createdAt: 1 });

    return CommentDTO.fromEntities(comments);
  }

  async getCommunitySidebar() {
    // Top 5 helpful users (highest points)
    const helpfulUsers = await this.userRepository.find({})
      .select('name profilePhoto points')
      .sort({ points: -1 })
      .limit(5);

    // Common tags (simple group check)
    const posts = await this.postRepository.find({}).select('tags');
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

    return {
      helpfulUsers,
      trendingTags
    };
  }
}

// Dependency Injection Composition
const postRepository = require('../repositories/postRepository');
const commentRepository = require('../repositories/commentRepository');
const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');

module.exports = new CommunityService(postRepository, commentRepository, userRepository, logger);
module.exports.CommunityService = CommunityService;
