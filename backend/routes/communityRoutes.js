const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  likePost,
  createComment,
  getPostComments,
  getCommunitySidebar
} = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/posts')
  .post(createPost)
  .get(getPosts);

router.post('/posts/like/:id', likePost);
router.post('/comments/:postId', createComment);
router.get('/comments/:postId', getPostComments);
router.get('/sidebar', getCommunitySidebar);

module.exports = router;
