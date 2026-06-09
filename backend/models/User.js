const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be negative'],
  },
  country: {
    type: String,
    default: 'Global',
  },
  profilePhoto: {
    type: String,
    default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', // placeholder premium profile photo
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  points: {
    type: Number,
    default: 0,
  },
  streak: {
    type: Number,
    default: 0,
  },
  lastLoginDate: {
    type: Date,
  },
  badges: {
    type: [String],
    default: ['Eco Beginner'], // Default badge
  },
  completedChallengesCount: {
    type: Number,
    default: 0,
  },
  completedChallenges: [{
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
    },
    completedAt: {
      type: Date,
      default: Date.now,
    }
  }],
  carbonSaved: {
    type: Number,
    default: 0, // Total estimated carbon saved in kg
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);
