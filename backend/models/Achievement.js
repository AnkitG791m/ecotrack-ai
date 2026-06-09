const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  badgeName: {
    type: String,
    required: true,
  },
  pointsRequired: {
    type: Number,
    default: 0,
  },
  challengesRequired: {
    type: Number,
    default: 0,
  },
  icon: {
    type: String,
    default: '🏆',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Achievement', AchievementSchema);
