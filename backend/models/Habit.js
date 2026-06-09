const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  completedDates: {
    type: [String], // Array of 'YYYY-MM-DD' dates when the habit was completed
    default: [],
  },
  streak: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Habit', HabitSchema);
