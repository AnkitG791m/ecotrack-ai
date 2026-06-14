const CarbonReport = require('../models/CarbonReport');
const User = require('../models/User');
const { calculateCarbonScore } = require('../utils/carbonCalc');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Calculate and save carbon footprint report
 * POST /api/calculator/calculate
 */
const saveCalculatorReport = async (req, res) => {
  try {
    const answers = req.body;
    if (!answers) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Please provide survey responses' });
    }

    // Run calculation logic
    const calcResult = calculateCarbonScore(answers);

    // Save report to database
    const report = await CarbonReport.create({
      user: req.user.id,
      score: calcResult.totalKgCO2,
      annualEstimation: calcResult.annualEstimationTons,
      category: calcResult.category,
      transportScore: calcResult.breakdown.transport,
      energyScore: calcResult.breakdown.energy,
      foodScore: calcResult.breakdown.food,
      wasteScore: calcResult.breakdown.waste,
      answers
    });

    // Update user stats
    const user = await User.findById(req.user.id);
    
    // Add points for completing calculation (if first time +100 points, else +30 points)
    const pastReportsCount = await CarbonReport.countDocuments({ user: req.user.id });
    let pointsEarned = 30;
    if (pastReportsCount === 1) {
      pointsEarned = 100; // Profile completion / First calculator completion bonus!
    }
    user.points += pointsEarned;

    // Gamification check: badges updating
    const currentBadges = new Set(user.badges);
    
    // Check footprint limits
    if (calcResult.annualEstimationTons <= 3.5) {
      currentBadges.add('Climate Hero');
      currentBadges.add('Green Warrior');
    } else if (calcResult.annualEstimationTons <= 6.0) {
      currentBadges.add('Green Warrior');
    }

    // Points-based badges
    if (user.points >= 1000) {
      currentBadges.add('Planet Protector');
      currentBadges.add('Eco Champion');
    } else if (user.points >= 500) {
      currentBadges.add('Eco Champion');
    }

    user.badges = Array.from(currentBadges);
    await user.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      pointsEarned,
      report,
      user: {
        points: user.points,
        badges: user.badges
      }
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ success: false, message: error.message });
  }
};

/**
 * Get user carbon reports history
 * GET /api/calculator/history
 */
const getHistory = async (req, res) => {
  try {
    const reports = await CarbonReport.find({ user: req.user.id }).sort({ createdAt: 1 });
    res.json({ success: true, reports });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ success: false, message: error.message });
  }
};

/**
 * Get latest carbon report
 * GET /api/calculator/latest
 */
const getLatestReport = async (req, res) => {
  try {
    const latest = await CarbonReport.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    if (!latest) {
      return res.status(HTTP_STATUS.OK).json({ success: true, report: null });
    }
    res.json({ success: true, report: latest });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ success: false, message: error.message });
  }
};

module.exports = {
  saveCalculatorReport,
  getHistory,
  getLatestReport
};
