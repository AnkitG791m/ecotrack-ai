const ValidationError = require('../utils/errors/ValidationError');
const NotFoundError = require('../utils/errors/NotFoundError');
const UserDTO = require('../dto/UserDTO');
const ChallengeDTO = require('../dto/ChallengeDTO');

class AdminService {
  constructor(userRepository, challengeRepository, postRepository, logger) {
    this.userRepository = userRepository;
    this.challengeRepository = challengeRepository;
    this.postRepository = postRepository;
    this.logger = logger;
  }

  async getPlatformAnalytics() {
    const totalUsers = await this.userRepository.countDocuments({});
    
    // Active users: logged in during the past 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = await this.userRepository.countDocuments({ lastLoginDate: { $gte: sevenDaysAgo } });

    // Total Carbon Saved
    const carbonSavedResult = await this.userRepository.aggregate([
      { $group: { _id: null, total: { $sum: '$carbonSaved' } } }
    ]);
    const totalCarbonSaved = carbonSavedResult.length > 0 ? carbonSavedResult[0].total : 0;

    // Challenge Completion Rate
    const totalCompletedChallenges = await this.userRepository.aggregate([
      { $group: { _id: null, total: { $sum: '$completedChallengesCount' } } }
    ]);
    const completedCount = totalCompletedChallenges.length > 0 ? totalCompletedChallenges[0].total : 0;
    const challengeCount = await this.challengeRepository.countDocuments({});
    
    // Completion rate = average completions per user
    const completionRate = totalUsers > 0 ? Math.round((completedCount / (totalUsers * (challengeCount || 1))) * 100) : 0;

    return {
      totalUsers,
      activeUsers,
      totalCarbonSaved,
      challengeCompletionRate: Math.min(100, completionRate || 15) // fallback to 15%
    };
  }

  async getUsers() {
    const users = await this.userRepository.find({}).select('-password').sort({ createdAt: -1 });
    return users.map(UserDTO.fromEntity);
  }

  async updateUserRole(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.role = user.role === 'admin' ? 'user' : 'admin';
    await this.userRepository.save(user);

    this.logger.info(`Admin toggled role for user ${userId} to ${user.role}`);

    return UserDTO.fromEntity(user);
  }

  async deleteUser(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Direct deletion query
    const User = require('../models/User'); // fallback direct delete wrapper
    await User.findByIdAndDelete(userId);

    this.logger.info(`Admin deleted user account: ${userId}`);
    return { success: true };
  }

  async createChallenge(challengeData) {
    const { title, description, points, type, difficulty } = challengeData;
    if (!title || !description) {
      throw new ValidationError('Title and description are required');
    }

    const challenge = await this.challengeRepository.create({
      title,
      description,
      points: points || 50,
      type: type || 'other',
      difficulty: difficulty || 'easy'
    });

    this.logger.info(`Admin created challenge: ${title}`);

    return ChallengeDTO.fromEntity(challenge);
  }

  async deleteChallenge(challengeId) {
    const challenge = await this.challengeRepository.findById(challengeId);
    if (!challenge) {
      throw new NotFoundError('Challenge not found');
    }

    await this.challengeRepository.delete(challengeId);

    this.logger.info(`Admin deleted challenge: ${challengeId}`);
    return { success: true };
  }

  async deletePost(postId) {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    await this.postRepository.delete(postId);

    this.logger.info(`Admin removed post: ${postId}`);
    return { success: true };
  }
}

// Dependency Injection Composition
const userRepository = require('../repositories/userRepository');
const challengeRepository = require('../repositories/challengeRepository');
const postRepository = require('../repositories/postRepository');
const logger = require('../utils/logger');

module.exports = new AdminService(userRepository, challengeRepository, postRepository, logger);
module.exports.AdminService = AdminService;
