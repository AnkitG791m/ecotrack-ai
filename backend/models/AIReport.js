const mongoose = require('mongoose');

const AIReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  carbonReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarbonReport',
  },
  recommendations: {
    type: [String],
    default: [],
  },
  weeklyPlan: {
    type: [String],
    default: [],
  },
  monthlyGoal: {
    type: String,
    default: '',
  },
  predictedNextMonthScore: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('AIReport', AIReportSchema);
