const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  upvotes: {
    type: Number,
    default: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
  tags: [String],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Post', PostSchema);
