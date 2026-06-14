const healthService = require('../services/healthService');
const { HTTP_STATUS } = require('../config/constants');
const asyncHandler = require('../middleware/asyncHandler');

const getHealth = (req, res) => {
  const result = healthService.getHealth();
  res.json(result);
};

const getDbHealth = (req, res) => {
  const result = healthService.getDbHealth();
  if (result.isHealthy) {
    res.json({
      success: true,
      status: result.status,
      connection: result.connection
    });
  } else {
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      status: result.status,
      connection: result.connection
    });
  }
};

const getAiHealth = asyncHandler(async (req, res) => {
  try {
    const result = await healthService.getAiHealth();
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = {
  getHealth,
  getDbHealth,
  getAiHealth
};
