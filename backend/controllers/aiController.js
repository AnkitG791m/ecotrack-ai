const aiService = require('../services/aiService');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Get or generate AI recommendations based on latest carbon calculator score
 * GET /api/ai/recommendations
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const aiReport = await aiService.getRecommendations(req.user.id);
  res.json({
    success: true,
    report: aiReport
  });
});

/**
 * AI Eco Chatbot
 * POST /api/ai/chatbot
 */
const queryChatbot = asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body;
  const reply = await aiService.queryChatbot(message, history);
  res.json({
    success: true,
    reply
  });
});

/**
 * Image analysis: Waste objects, environmental impact & suggestions
 * POST /api/ai/analyze-image
 */
const analyzeImage = asyncHandler(async (req, res) => {
  const { image } = req.body;
  const analysis = await aiService.analyzeImage(image);
  res.json({
    success: true,
    analysis
  });
});

/**
 * Scan Electricity Bill
 * POST /api/ai/scan-bill
 */
const scanBill = asyncHandler(async (req, res) => {
  const { image } = req.body;
  const scan = await aiService.scanBill(image);
  res.json({
    success: true,
    scan
  });
});

/**
 * Carbon Footprint Prediction (AI-driven next month projection)
 * GET /api/ai/predict
 */
const predictFootprint = asyncHandler(async (req, res) => {
  const result = await aiService.predictFootprint(req.user.id);
  res.json({
    success: true,
    ...result
  });
});

module.exports = {
  getRecommendations,
  queryChatbot,
  analyzeImage,
  scanBill,
  predictFootprint
};
