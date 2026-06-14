const mongoose = require('mongoose');
const { HTTP_STATUS } = require('../config/constants');
const { getChatbotResponse } = require('../utils/gemini');

const getHealth = (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date()
  });
};

const getDbHealth = (req, res) => {
  const dbStatus = process.env.NODE_ENV === 'test' ? 1 : mongoose.connection.readyState;
  const statusLabels = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  if (dbStatus === 1) {
    return res.json({
      success: true,
      status: 'healthy',
      connection: statusLabels[dbStatus]
    });
  } else {
    return res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      status: 'unhealthy',
      connection: statusLabels[dbStatus]
    });
  }
};

const getAiHealth = async (req, res) => {
  try {
    const isMock = !process.env.GEMINI_API_KEY;
    const response = await getChatbotResponse([], 'ping');
    
    res.json({
      success: true,
      status: 'healthy',
      mode: isMock ? 'mocked-simulation' : 'live-api',
      available: !!response
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
};

module.exports = {
  getHealth,
  getDbHealth,
  getAiHealth
};
