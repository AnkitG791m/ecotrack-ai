const express = require('express');
const router = express.Router();
const {
  saveCalculatorReport,
  getHistory,
  getLatestReport
} = require('../controllers/calculatorController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/calculate', saveCalculatorReport);
router.get('/history', getHistory);
router.get('/latest', getLatestReport);

module.exports = router;
