class IUserRepository {
  findById(id) { throw new Error('Method not implemented'); }
  findByIdWithoutPassword(id) { throw new Error('Method not implemented'); }
  findOne(query) { throw new Error('Method not implemented'); }
  create(userData) { throw new Error('Method not implemented'); }
  save(userInstance) { throw new Error('Method not implemented'); }
  countDocuments(query) { throw new Error('Method not implemented'); }
  find(query) { throw new Error('Method not implemented'); }
  aggregate(pipeline) { throw new Error('Method not implemented'); }
}
module.exports = IUserRepository;
