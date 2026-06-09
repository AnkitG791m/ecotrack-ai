const mongoose = require('mongoose');

const CarbonReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  score: {
    type: Number,
    required: true, // total weekly emissions in kg CO2
  },
  annualEstimation: {
    type: Number,
    required: true, // estimated annual emissions in metric tons CO2
  },
  category: {
    type: String,
    enum: ['green', 'yellow', 'red'],
    required: true,
  },
  transportScore: {
    type: Number,
    default: 0,
  },
  energyScore: {
    type: Number,
    default: 0,
  },
  foodScore: {
    type: Number,
    default: 0,
  },
  wasteScore: {
    type: Number,
    default: 0,
  },
  answers: {
    type: Object, // Raw answers from the multi-step form
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('CarbonReport', CarbonReportSchema);
