const UserDTO = require('./UserDTO');

class CommentDTO {
  static fromEntity(comment) {
    if (!comment) return null;
    return {
      _id: comment._id,
      post: comment.post,
      user: comment.user && typeof comment.user === 'object' && comment.user.name ? UserDTO.fromEntity(comment.user) : comment.user,
      content: comment.content,
      createdAt: comment.createdAt
    };
  }

  static fromEntities(comments) {
    if (!comments) return [];
    return comments.map(CommentDTO.fromEntity);
  }
}
module.exports = CommentDTO;
