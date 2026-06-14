const UserDTO = require('./UserDTO');

class PostDTO {
  static fromEntity(post) {
    if (!post) return null;
    return {
      _id: post._id,
      user: post.user && typeof post.user === 'object' && post.user.name ? UserDTO.fromEntity(post.user) : post.user,
      title: post.title,
      content: post.content,
      tags: post.tags,
      likes: post.likes,
      upvotes: post.upvotes,
      commentsCount: post.commentsCount,
      createdAt: post.createdAt
    };
  }

  static fromEntities(posts) {
    if (!posts) return [];
    return posts.map(PostDTO.fromEntity);
  }
}
module.exports = PostDTO;
