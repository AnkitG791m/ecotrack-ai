const express = require('express');
const router = express.Router();
const {
  getPlatformAnalytics,
  getUsers,
  updateUserRole,
  deleteUser,
  createChallenge,
  deleteChallenge,
  deletePost
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// Protect all admin routes
router.use(protect);
router.use(admin);

router.get('/analytics', getPlatformAnalytics);
router.get('/users', getUsers);
router.route('/users/:id')
  .put(updateUserRole)
  .delete(deleteUser);

router.post('/challenges', createChallenge);
router.delete('/challenges/:id', deleteChallenge);
router.delete('/posts/:id', deletePost);

module.exports = router;
