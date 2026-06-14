const { calculateCarbonScore } = require('../utils/carbonCalc');
const ValidationError = require('../utils/errors/ValidationError');
const NotFoundError = require('../utils/errors/NotFoundError');
const CarbonReportDTO = require('../dto/CarbonReportDTO');

class CarbonService {
  constructor(carbonRepository, userRepository, logger) {
    this.carbonRepository = carbonRepository;
    this.userRepository = userRepository;
    this.logger = logger;
  }

  async saveCalculatorReport(userId, answers) {
    const calcResult = calculateCarbonScore(answers);

    const report = await this.carbonRepository.create({
      user: userId,
      score: calcResult.totalKgCO2,
      annualEstimation: calcResult.annualEstimationTons,
      category: calcResult.category,
      transportScore: calcResult.breakdown.transport,
      energyScore: calcResult.breakdown.energy,
      foodScore: calcResult.breakdown.food,
      wasteScore: calcResult.breakdown.waste,
      answers
    });

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const pastReportsCount = await this.carbonRepository.countDocuments({ user: userId });
    let pointsEarned = pastReportsCount === 1 ? 100 : 30;
    user.points += pointsEarned;

    const currentBadges = new Set(user.badges);

    if (calcResult.annualEstimationTons <= 3.5) {
      currentBadges.add('Climate Hero');
      currentBadges.add('Green Warrior');
    } else if (calcResult.annualEstimationTons <= 6.0) {
      currentBadges.add('Green Warrior');
    }

    if (user.points >= 1000) {
      currentBadges.add('Planet Protector');
      currentBadges.add('Eco Champion');
    } else if (user.points >= 500) {
      currentBadges.add('Eco Champion');
    }

    user.badges = Array.from(currentBadges);
    await this.userRepository.save(user);

    this.logger.info(`Carbon calculator report saved for user: ${userId}, score: ${calcResult.totalKgCO2}`);

    return {
      pointsEarned,
      report: CarbonReportDTO.fromEntity(report),
      user: {
        points: user.points,
        badges: user.badges
      }
    };
  }

  async getHistory(userId) {
    const reports = await this.carbonRepository.find({ user: userId }).sort({ createdAt: 1 });
    return CarbonReportDTO.fromEntities(reports);
  }

  async getLatestReport(userId) {
    const report = await this.carbonRepository.findOne({ user: userId }).sort({ createdAt: -1 });
    return CarbonReportDTO.fromEntity(report);
  }
}

// Dependency Injection Composition
const carbonRepository = require('../repositories/carbonRepository');
const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');

module.exports = new CarbonService(carbonRepository, userRepository, logger);
module.exports.CarbonService = CarbonService;
