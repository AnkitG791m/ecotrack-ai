const carbonService = require('../services/carbonService');
const asyncHandler = require('../middleware/asyncHandler');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Calculate and save carbon footprint report
 * POST /api/calculator/calculate
 */
const saveCalculatorReport = asyncHandler(async (req, res) => {
  const result = await carbonService.saveCalculatorReport(req.user.id, req.body);
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
