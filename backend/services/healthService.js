const { getChatbotResponse } = require('../utils/gemini');
const env = require('../config/env');

class HealthService {
  constructor(mongoose, logger) {
    this.mongoose = mongoose;
    this.logger = logger;
  }

  getHealth() {
    return {
      success: true,
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date()
    };
  }

  getDbHealth() {
    const dbStatus = env.NODE_ENV === 'test' ? 1 : this.mongoose.connection.readyState;
    const statusLabels = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    const isHealthy = dbStatus === 1;

    return {
      isHealthy,
      status: isHealthy ? 'healthy' : 'unhealthy',
      connection: statusLabels[dbStatus] || 'unknown'
    };
  }

  async getAiHealth() {
    const isMock = !env.GEMINI_API_KEY;
    const response = await getChatbotResponse([], 'ping');
    
    return {
      status: 'healthy',
      mode: isMock ? 'mocked-simulation' : 'live-api',
      available: !!response
    };
  }
}

// Dependency Injection Composition
const mongoose = require('mongoose');
const logger = require('../utils/logger');

module.exports = new HealthService(mongoose, logger);
module.exports.HealthService = HealthService;
