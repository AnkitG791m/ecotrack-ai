const Challenge = require('../models/Challenge');
const IChallengeRepository = require('./interfaces/IChallengeRepository');

class ChallengeRepository extends IChallengeRepository {
  find(query) {
    return Challenge.find(query);
  }

  async findById(id) {
    return await Challenge.findById(id);
  }

  async create(challengeData) {
    return await Challenge.create(challengeData);
  }

  async delete(id) {
    return await Challenge.findByIdAndDelete(id);
  }

  async countDocuments(query) {
    return await Challenge.countDocuments(query);
  }

  async insertMany(challenges) {
    return await Challenge.insertMany(challenges);
  }
}

module.exports = new ChallengeRepository();
