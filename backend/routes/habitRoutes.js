const express = require('express');
const router = express.Router();
const { getHabits, toggleHabit } = require('../controllers/habitController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getHabits);
router.post('/toggle', toggleHabit);

module.exports = router;
