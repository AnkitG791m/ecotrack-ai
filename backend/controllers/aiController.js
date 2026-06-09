const AIReport = require('../models/AIReport');
const CarbonReport = require('../models/CarbonReport');
const {
  generateAIRecommendations,
  getChatbotResponse,
  analyzeWasteImage,
  scanElectricityBill
} = require('../utils/gemini');

/**
 * Get or generate AI recommendations based on latest carbon calculator score
 * GET /api/ai/recommendations
 */
const getRecommendations = async (req, res) => {
  try {
    // Get latest report
    const latestReport = await CarbonReport.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    if (!latestReport) {
      return res.status(400).json({
        success: false,
        message: 'No carbon calculator reports found. Please calculate your carbon footprint first!'
      });
    }

    // Call Gemini utility
    const aiData = await generateAIRecommendations(latestReport.answers, latestReport);

    // Save recommendations report
    const aiReport = await AIReport.create({
      user: req.user.id,
      carbonReport: latestReport._id,
      recommendations: aiData.recommendations,
      weeklyPlan: aiData.weeklyPlan,
      monthlyGoal: aiData.monthlyGoal,
      predictedNextMonthScore: aiData.predictedNextMonthScore
    });

    res.json({
      success: true,
      report: aiReport
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * AI Eco Chatbot
 * POST /api/ai/chatbot
 */
const queryChatbot = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Please provide a message' });
    }

    const responseText = await getChatbotResponse(history, message);

    res.json({
      success: true,
      reply: responseText
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Image analysis: Waste objects, environmental impact & suggestions
 * POST /api/ai/analyze-image
 */
const analyzeImage = async (req, res) => {
  try {
    const { image } = req.body; // Expects base64 encoded image string (e.g. data:image/png;base64,...)
    if (!image) {
      return res.status(400).json({ success: false, message: 'Please provide a base64 image string' });
    }

    // Parse base64 data and mimeType
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, message: 'Invalid base64 image format' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    const analysisResult = await analyzeWasteImage(base64Data, mimeType);

    res.json({
      success: true,
      analysis: analysisResult
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Scan Electricity Bill
 * POST /api/ai/scan-bill
 */
const scanBill = async (req, res) => {
  try {
    const { image } = req.body; // Expects base64 electricity bill image
    if (!image) {
      return res.status(400).json({ success: false, message: 'Please provide a base64 bill image' });
    }

    // Parse base64 data and mimeType
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, message: 'Invalid base64 image format' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    const scanResult = await scanElectricityBill(base64Data, mimeType);

    res.json({
      success: true,
      scan: scanResult
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Carbon Footprint Prediction (AI-driven next month projection)
 * GET /api/ai/predict
 */
const predictFootprint = async (req, res) => {
  try {
    const reports = await CarbonReport.find({ user: req.user.id }).sort({ createdAt: 1 });
    
    if (reports.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient data for prediction. Please complete your carbon footprint calculator first.'
      });
    }

    // Predict score based on trend analysis
    let nextMonthScore = 0;
    let trendDirection = 'stable'; // 'improving', 'worsening', 'stable'
    let message = '';

    if (reports.length === 1) {
      // Single report: predict a small baseline reduction (e.g. 5%) if habits are optimized
      nextMonthScore = Math.round(reports[0].score * 0.95);
      trendDirection = 'stable';
      message = 'Your trend is starting out. By adopting daily green challenges, you can project a 5% carbon footprint reduction next month.';
    } else {
      // Multiple reports: analyze the trend
      const firstScore = reports[0].score;
      const lastScore = reports[reports.length - 1].score;
      
      const changePercent = ((lastScore - firstScore) / firstScore) * 100;
      
      if (changePercent < -2) {
        trendDirection = 'improving';
        nextMonthScore = Math.round(lastScore * 0.92); // Project a further 8% drop
        message = 'Fantastic progress! Your emissions are trending downwards. If you continue with your current habits, next month’s footprint is predicted to drop further.';
      } else if (changePercent > 2) {
        trendDirection = 'worsening';
        nextMonthScore = Math.round(lastScore * 0.98); // Project a slow recovery
        message = 'Alert: Your carbon footprint has increased over time. We project you can decrease it by 2% next month if you start completing daily challenges.';
      } else {
        trendDirection = 'stable';
        nextMonthScore = Math.round(lastScore * 0.95);
        message = 'Your carbon footprint has been stable. Swapping to public transit could push this down by 5% next month.';
      }
    }

    res.json({
      success: true,
      currentScore: reports[reports.length - 1].score,
      annualEstimationTons: reports[reports.length - 1].annualEstimation,
      predictedNextMonthScore: nextMonthScore,
      predictedNextMonthTons: parseFloat(((nextMonthScore) / 1000).toFixed(2)),
      trendDirection,
      message
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRecommendations,
  queryChatbot,
  analyzeImage,
  scanBill,
  predictFootprint
};
