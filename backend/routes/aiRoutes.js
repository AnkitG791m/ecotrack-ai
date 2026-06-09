const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  queryChatbot,
  analyzeImage,
  scanBill,
  predictFootprint
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/recommendations', getRecommendations);
router.post('/chatbot', queryChatbot);
router.post('/analyze-image', analyzeImage);
router.post('/scan-bill', scanBill);
router.get('/predict', predictFootprint);

module.exports = router;
