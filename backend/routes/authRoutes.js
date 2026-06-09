const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  googleLogin,
  getProfile,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

module.exports = router;
