const express = require('express');
const router = express.Router();
const { getChallenges, completeChallenge } = require('../controllers/challengeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300');
  next();
}, getChallenges);
router.post('/complete/:id', completeChallenge);

module.exports = router;
