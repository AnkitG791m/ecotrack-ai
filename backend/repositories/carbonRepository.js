const CarbonReport = require('../models/CarbonReport');

class CarbonRepository {
  async findById(id) {
    return await CarbonReport.findById(id);
  }

  findOne(query) {
    return CarbonReport.findOne(query);
  }

  async create(reportData) {
    return await CarbonReport.create(reportData);
  }

  find(query) {
    return CarbonReport.find(query);
  }

  async countDocuments(query) {
    return await CarbonReport.countDocuments(query);
  }
}

module.exports = new CarbonRepository();
