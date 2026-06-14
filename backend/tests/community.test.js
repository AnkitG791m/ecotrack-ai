const request = require('supertest');
const app = require('../server');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

jest.mock('../models/Post');
jest.mock('../models/Comment');
jest.mock('../models/User');

describe('EcoTrack AI - Community Forums API', () => {
  let mockToken = '';
  let mockUserObj = {};

  beforeEach(() => {
    mockToken = jwt.sign({ id: 'mockUserId123' }, env.JWT_SECRET);
    mockUserObj = {
      _id: 'mockUserId123',
      name: 'John Doe',
      email: 'john@example.com',
      points: 100,
      save: jest.fn().mockResolvedValue(true)
    };

    // authMiddleware calls userRepository.findByIdWithoutPassword => User.findById(id).select('-password')
    // So User.findById must return an object with .select() that resolves to mockUserObj
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUserObj),
      then: (onFulfilled, onRejected) => Promise.resolve(mockUserObj).then(onFulfilled, onRejected)
    });

    User.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([mockUserObj])
        })
      })
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new tip post', async () => {
    Post.create.mockResolvedValue({ _id: 'postId123', title: 'Compost!' });

    // postRepository.findById returns Post.findById() which must support .populate()
    Post.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: 'postId123',
        title: 'Compost!',
        user: { name: 'Eco Man', profilePhoto: '', points: 100 }
      })
    });

    const res = await request(app)
      .post('/api/community/posts')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ title: 'Compost!', content: 'Use a container.' });

    expect(res.statusCode).toBe(201);
    expect(res.body.post.title).toBe('Compost!');
  });

  it('should reject post creation with missing title or content', async () => {
    const res = await request(app)
      .post('/api/community/posts')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ title: 'Compost!' }); // missing content

    expect(res.statusCode).toBe(400);
  });

  it('should fetch posts list', async () => {
    Post.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { title: 'Tip 1', content: 'Details' }
        ])
      })
    });

    const res = await request(app)
      .get('/api/community/posts')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.posts.length).toBe(1);
  });

  it('should add a post comment', async () => {
    // postRepository.findById needs to return a thenable (direct await) AND NO populate chain used here
    Post.findById.mockReturnValue({
      then: (onFulfilled, onRejected) => Promise.resolve({
        _id: 'postId123',
        commentsCount: 0,
        save: jest.fn().mockResolvedValue(true)
      }).then(onFulfilled, onRejected)
    });

    Comment.create.mockResolvedValue({ _id: 'commentId123' });
    Comment.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: 'commentId123',
        content: 'Great tip!',
        user: { name: 'A', profilePhoto: '' }
      })
    });

    const res = await request(app)
      .post('/api/community/comments/postId123')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ content: 'Great tip!' });

    expect(res.statusCode).toBe(201);
    expect(res.body.comment.content).toBe('Great tip!');
  });

  it('should get comments for a post', async () => {
    Comment.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { content: 'Comment 1' }
        ])
      })
    });

    const res = await request(app)
      .get('/api/community/comments/postId123')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.comments.length).toBe(1);
  });

  it('should fetch community statistics/sidebar info', async () => {
    // communityService.getCommunitySidebar() calls:
    // 1) userRepository.find({}).select(...).sort(...).limit(...)
    // 2) postRepository.find({}).select('tags')  <-- needs select chain
    User.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([mockUserObj])
        })
      })
    });

    Post.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([
        { tags: ['plastic', 'energy'] }
      ])
    });

    const res = await request(app)
      .get('/api/community/sidebar')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.helpfulUsers).toBeDefined();
    expect(res.body.trendingTags).toBeDefined();
  });
});
