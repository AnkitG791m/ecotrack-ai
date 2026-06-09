const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    default: 50,
  },
  type: {
    type: String,
    enum: ['water', 'plastic', 'transport', 'energy', 'waste', 'food', 'other'],
    default: 'other',
  },
  isDaily: {
    type: Boolean,
    default: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
