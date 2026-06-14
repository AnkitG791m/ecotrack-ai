const User = require('../models/User');

class UserRepository {
  async findById(id) {
    return await User.findById(id);
  }

  async findByIdWithoutPassword(id) {
    return await User.findById(id).select('-password');
  }

  findOne(query) {
    return User.findOne(query);
  }

  async create(userData) {
    return await User.create(userData);
  }

  async save(userInstance) {
    return await userInstance.save();
  }

  async countDocuments(query) {
    return await User.countDocuments(query);
  }

  find(query) {
    return User.find(query);
  }

  async aggregate(pipeline) {
    return await User.aggregate(pipeline);
  }
}

module.exports = new UserRepository();
