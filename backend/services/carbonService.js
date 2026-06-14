const carbonRepository = require('../repositories/carbonRepository');
const userRepository = require('../repositories/userRepository');
const { calculateCarbonScore } = require('../utils/carbonCalc');

class CarbonService {
  async saveCalculatorReport(userId, answers) {
    const calcResult = calculateCarbonScore(answers);

    const report = await carbonRepository.create({
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

    const user = await userRepository.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    const pastReportsCount = await carbonRepository.countDocuments({ user: userId });
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
    await userRepository.save(user);

    return {
      pointsEarned,
      report,
      user: {
        points: user.points,
        badges: user.badges
      }
    };
  }

  async getHistory(userId) {
    return await carbonRepository.find({ user: userId }).sort({ createdAt: 1 });
  }

  async getLatestReport(userId) {
    return await carbonRepository.findOne({ user: userId }).sort({ createdAt: -1 });
  }
}

module.exports = new CarbonService();
