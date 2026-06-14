const AIReport = require('../models/AIReport');
const IAIReportRepository = require('./interfaces/IAIReportRepository');

class AIReportRepository extends IAIReportRepository {
  async create(aiReportData) {
    return await AIReport.create(aiReportData);
  }

  async findById(id) {
    return await AIReport.findById(id);
  }

  find(query) {
    return AIReport.find(query);
  }
}

module.exports = new AIReportRepository();
