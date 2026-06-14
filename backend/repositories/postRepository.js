const Post = require('../models/Post');
const IPostRepository = require('./interfaces/IPostRepository');

class PostRepository extends IPostRepository {
  async create(postData) {
    return await Post.create(postData);
  }

  findById(id) {
    return Post.findById(id);
  }

  find(query) {
    return Post.find(query);
  }

  async save(postInstance) {
    return await postInstance.save();
  }

  async delete(id) {
    return await Post.findByIdAndDelete(id);
  }
}

module.exports = new PostRepository();
