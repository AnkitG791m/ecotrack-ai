const Comment = require('../models/Comment');
const ICommentRepository = require('./interfaces/ICommentRepository');

class CommentRepository extends ICommentRepository {
  async create(commentData) {
    return await Comment.create(commentData);
  }

  findById(id) {
    return Comment.findById(id);
  }

  find(query) {
    return Comment.find(query);
  }
}

module.exports = new CommentRepository();
