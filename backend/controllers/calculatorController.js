const carbonService = require('../services/carbonService');
const asyncHandler = require('../middleware/asyncHandler');
const { calculatorAnswersSchema } = require('../validators/calculatorValidator');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Calculate and save carbon footprint report
 * POST /api/calculator/calculate
 */
const saveCalculatorReport = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    const err = new Error('Survey answers cannot be empty');
    err.statusCode = HTTP_STATUS.BAD_REQUEST;
    throw err;
  }

  // Validate request body using Zod schema
  const validatedAnswers = calculatorAnswersSchema.parse(req.body);

  const result = await carbonService.saveCalculatorReport(req.user.id, validatedAnswers);
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    ...result
  });
});

/**
 * Get user carbon reports history
 * GET /api/calculator/history
 */
const getHistory = asyncHandler(async (req, res) => {
  const reports = await carbonService.getHistory(req.user.id);
  res.json({
    success: true,
    reports
  });
});

/**
 * Get latest carbon report
 * GET /api/calculator/latest
 */
const getLatestReport = asyncHandler(async (req, res) => {
  const latest = await carbonService.getLatestReport(req.user.id);
  res.json({
    success: true,
    report: latest
  });
});

module.exports = {
  saveCalculatorReport,
  getHistory,
  getLatestReport
};
