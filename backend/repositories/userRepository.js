const User = require('../models/User');
const IUserRepository = require('./interfaces/IUserRepository');

class UserRepository extends IUserRepository {
  async findById(id) {
    return await User.findById(id);
  }

  async findByIdWithoutPassword(id) {
    const query = User.findById(id);
    if (query && typeof query.select === 'function') {
      return await query.select('-password');
    }
    return await query;
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
