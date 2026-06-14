const ValidationError = require('../utils/errors/ValidationError');
const NotFoundError = require('../utils/errors/NotFoundError');
const ChallengeDTO = require('../dto/ChallengeDTO');

// Default eco-challenges to seed database if empty
const defaultChallenges = [
  {
    title: 'Use Reusable Water Bottle',
    description: 'Avoid single-use plastic bottles today by carrying a reusable flask.',
    points: 50,
    type: 'plastic',
    difficulty: 'easy'
  },
  {
    title: 'Walk or Cycle 2km',
    description: 'Leave the car behind and complete short trips on foot or by bicycle.',
    points: 50,
    type: 'transport',
    difficulty: 'medium'
  },
  {
    title: 'Switch Off Unnecessary Lights',
    description: 'Walk around your house and switch off any unused lights or standby electronics.',
    points: 50,
    type: 'energy',
    difficulty: 'easy'
  },
  {
    title: 'Eat Fully Vegetarian',
    description: 'Adopt a full plant-based diet for today to conserve water and cut farming emissions.',
    points: 50,
    type: 'food',
    difficulty: 'medium'
  },
  {
    title: 'Avoid Plastic Bags',
    description: 'Use your own canvas or tote bag when shopping today.',
    points: 50,
    type: 'plastic',
    difficulty: 'easy'
  },
  {
    title: 'Set AC to 25°C or higher',
    description: 'Keep your cooling energy consumption low by using fans and setting the AC to 25°C.',
    points: 50,
    type: 'energy',
    difficulty: 'medium'
  }
];

class ChallengeService {
  constructor(challengeRepository, userRepository, logger) {
    this.challengeRepository = challengeRepository;
    this.userRepository = userRepository;
    this.logger = logger;
  }

  async getChallenges() {
    let challenges = await this.challengeRepository.find({});
    
    // Auto-seed challenges if database is empty
    if (challenges.length === 0) {
      await this.challengeRepository.insertMany(defaultChallenges);
      challenges = await this.challengeRepository.find({});
      this.logger.info('Auto-seeded default challenges database');
    }

    return ChallengeDTO.fromEntities(challenges);
  }

  async completeChallenge(userId, challengeId) {
    const challenge = await this.challengeRepository.findById(challengeId);
    if (!challenge) {
      throw new NotFoundError('Challenge not found');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Check if completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyCompletedToday = user.completedChallenges.some(item => {
      const compDate = new Date(item.completedAt);
      compDate.setHours(0, 0, 0, 0);
      return item.challenge.toString() === challengeId && compDate.getTime() === today.getTime();
    });

    if (alreadyCompletedToday) {
      throw new ValidationError('You have already completed this challenge today!');
    }

    // Award points and stats
    user.points += challenge.points;
    user.completedChallengesCount += 1;
    
    // Assume each completed challenge saves approx 2kg CO2 on average
    user.carbonSaved += 2; 

    // Record challenge completion
    user.completedChallenges.push({
      challenge: challengeId,
      completedAt: new Date()
    });

    // Check for point-based achievements/badges
    const currentBadges = new Set(user.badges);
    if (user.points >= 1000) {
      currentBadges.add('Planet Protector');
      currentBadges.add('Eco Champion');
    } else if (user.points >= 500) {
      currentBadges.add('Eco Champion');
    }
    user.badges = Array.from(currentBadges);

    await this.userRepository.save(user);

    this.logger.info(`User ${userId} completed challenge ${challengeId}, earned ${challenge.points} XP`);

    return {
      pointsEarned: challenge.points,
      user: {
        points: user.points,
        completedChallengesCount: user.completedChallengesCount,
        carbonSaved: user.carbonSaved,
        badges: user.badges
      }
    };
  }
}

// Dependency Injection Composition
const challengeRepository = require('../repositories/challengeRepository');
const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');

module.exports = new ChallengeService(challengeRepository, userRepository, logger);
module.exports.ChallengeService = ChallengeService;
