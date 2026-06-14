const AIReport = require('../models/AIReport');
const carbonRepository = require('../repositories/carbonRepository');
const {
  generateAIRecommendations,
  getChatbotResponse,
  analyzeWasteImage,
  scanElectricityBill
} = require('../utils/gemini');

class AiService {
  async getRecommendations(userId) {
    const latestReport = await carbonRepository.findOne({ user: userId }).sort({ createdAt: -1 });
    if (!latestReport) {
      const err = new Error('No carbon calculator reports found. Please calculate your carbon footprint first!');
      err.statusCode = 400;
      throw err;
    }

    const aiData = await generateAIRecommendations(latestReport.answers, latestReport);

    const aiReport = await AIReport.create({
      user: userId,
      carbonReport: latestReport._id,
      recommendations: aiData.recommendations,
      weeklyPlan: aiData.weeklyPlan,
      monthlyGoal: aiData.monthlyGoal,
      predictedNextMonthScore: aiData.predictedNextMonthScore
    });

    return aiReport;
  }

  async queryChatbot(message, history) {
    if (!message) {
      const err = new Error('Please provide a message');
      err.statusCode = 400;
      throw err;
    }
    return await getChatbotResponse(history, message);
  }

  async analyzeImage(image) {
    if (!image) {
      const err = new Error('Please provide a base64 image string');
      err.statusCode = 400;
      throw err;
    }

    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      const err = new Error('Invalid base64 image format');
      err.statusCode = 400;
      throw err;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    return await analyzeWasteImage(base64Data, mimeType);
  }

  async scanBill(billImage) {
    if (!billImage) {
      const err = new Error('Please provide a base64 bill image string');
      err.statusCode = 400;
      throw err;
    }

    const matches = billImage.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      const err = new Error('Invalid base64 image format');
      err.statusCode = 400;
      throw err;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    return await scanElectricityBill(base64Data, mimeType);
  }

  async predictFootprint(userId) {
    const reports = await carbonRepository.find({ user: userId }).sort({ createdAt: 1 });
    
    if (reports.length === 0) {
      const err = new Error('Insufficient data for prediction. Please complete your carbon footprint calculator first.');
      err.statusCode = 400;
      throw err;
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

module.exports = new AiService();
