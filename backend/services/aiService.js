const ValidationError = require('../utils/errors/ValidationError');
const NotFoundError = require('../utils/errors/NotFoundError');
const {
  generateAIRecommendations,
  getChatbotResponse,
  analyzeWasteImage,
  scanElectricityBill
} = require('../utils/gemini');

class AiService {
  constructor(aiReportRepository, carbonRepository, logger) {
    this.aiReportRepository = aiReportRepository;
    this.carbonRepository = carbonRepository;
    this.logger = logger;
  }

  async getRecommendations(userId) {
    const latestReport = await this.carbonRepository.findOne({ user: userId }).sort({ createdAt: -1 });
    if (!latestReport) {
      throw new ValidationError('No carbon calculator reports found. Please calculate your carbon footprint first!');
    }

    const aiData = await generateAIRecommendations(latestReport.answers, latestReport);

    const aiReport = await this.aiReportRepository.create({
      user: userId,
      carbonReport: latestReport._id,
      recommendations: aiData.recommendations,
      weeklyPlan: aiData.weeklyPlan,
      monthlyGoal: aiData.monthlyGoal,
      predictedNextMonthScore: aiData.predictedNextMonthScore
    });

    this.logger.info(`Generated AI recommendations for user: ${userId}`);

    return aiReport;
  }

  async queryChatbot(message, history) {
    if (!message) {
      throw new ValidationError('Please provide a message');
    }
    return await getChatbotResponse(history, message);
  }

  async analyzeImage(image) {
    if (!image) {
      throw new ValidationError('Please provide a base64 image string');
    }

    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new ValidationError('Invalid base64 image format');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    this.logger.info('Analyzing waste image via Gemini AI');
    return await analyzeWasteImage(base64Data, mimeType);
  }

  async scanBill(billImage) {
    if (!billImage) {
      throw new ValidationError('Please provide a base64 bill image string');
    }

    const matches = billImage.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new ValidationError('Invalid base64 image format');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    this.logger.info('Scanning electricity bill via Gemini AI');
    return await scanElectricityBill(base64Data, mimeType);
  }

  async predictFootprint(userId) {
    const reports = await this.carbonRepository.find({ user: userId }).sort({ createdAt: 1 });
    
    if (reports.length === 0) {
      throw new ValidationError('Insufficient data for prediction. Please complete your carbon footprint calculator first.');
    }

    let nextMonthScore = 0;
    let trendDirection = 'stable';
    let message = '';

    if (reports.length === 1) {
      nextMonthScore = Math.round(reports[0].score * 0.95);
      trendDirection = 'stable';
      message = 'Your trend is starting out. By adopting daily green challenges, you can project a 5% carbon footprint reduction next month.';
    } else {
      const firstScore = reports[0].score;
      const lastScore = reports[reports.length - 1].score;
      const changePercent = ((lastScore - firstScore) / firstScore) * 100;
      
      if (changePercent < -2) {
        trendDirection = 'improving';
        nextMonthScore = Math.round(lastScore * 0.92);
        message = 'Fantastic progress! Your emissions are trending downwards. If you continue with your current habits, next month’s footprint is predicted to drop further.';
      } else if (changePercent > 2) {
        trendDirection = 'worsening';
        nextMonthScore = Math.round(lastScore * 0.98);
        message = 'Alert: Your carbon footprint has increased over time. We project you can decrease it by 2% next month if you start completing daily challenges.';
      } else {
        trendDirection = 'stable';
        nextMonthScore = Math.round(lastScore * 0.95);
        message = 'Your carbon footprint has been stable. Swapping to public transit could push this down by 5% next month.';
      }
    }

    return {
      currentScore: reports[reports.length - 1].score,
      annualEstimationTons: reports[reports.length - 1].annualEstimation,
      predictedNextMonthScore: nextMonthScore,
      predictedNextMonthTons: parseFloat(((nextMonthScore) / 1000).toFixed(2)),
      trendDirection,
      message
    };
  }
}

// Dependency Injection Composition
const aiReportRepository = require('../repositories/aiReportRepository');
const carbonRepository = require('../repositories/carbonRepository');
const logger = require('../utils/logger');

module.exports = new AiService(aiReportRepository, carbonRepository, logger);
module.exports.AiService = AiService;
