const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const CarbonReport = require('../models/CarbonReport');
const Challenge = require('../models/Challenge');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Habit = require('../models/Habit');
const AIReport = require('../models/AIReport');

// Mock all Mongoose models
jest.mock('../models/User');
jest.mock('../models/CarbonReport');
jest.mock('../models/Challenge');
jest.mock('../models/Post');
jest.mock('../models/Comment');
jest.mock('../models/Habit');
jest.mock('../models/AIReport');

describe('EcoTrack AI - Test Suite', () => {
  let mockToken = '';
  let mockUserObj = {};

  beforeAll(() => {
    // Generate a dummy JWT token for auth header tests
    const jwt = require('jsonwebtoken');
    mockToken = jwt.sign({ id: 'mockUserId123' }, process.env.JWT_SECRET || 'supersecret_ecotrack_jwt_key');
  });

  beforeEach(() => {
    mockUserObj = {
      _id: 'mockUserId123',
      name: 'John Doe',
      email: 'john@example.com',
      points: 100,
      streak: 2,
      badges: ['Eco Beginner'],
      role: 'user',
      completedChallenges: [],
      save: jest.fn().mockResolvedValue(true)
    };

    // Global mock implementations
    const userFindByIdMockQuery = {
      select: jest.fn().mockImplementation(function() {
        return Promise.resolve(mockUserObj);
      }),
      then: function(onFulfilled, onRejected) {
        return Promise.resolve(mockUserObj).then(onFulfilled, onRejected);
      }
    };
    User.findById.mockReturnValue(userFindByIdMockQuery);
    User.findOne.mockResolvedValue(mockUserObj);
    User.create.mockResolvedValue(mockUserObj);
    CarbonReport.create.mockResolvedValue({
      _id: 'reportId123',
      score: 5200,
      annualEstimation: 5.2
    });
    Challenge.find.mockResolvedValue([
      { _id: 'ch1', title: 'Use flask', points: 50, difficulty: 'easy' }
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- 1. HEALTH CHECK (3 Tests) ---
  describe('Health Check API', () => {
    it('should return 200 OK for root endpoint', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
    });

    it('should return JSON content type', async () => {
      const res = await request(app).get('/');
      expect(res.headers['content-type']).toMatch(/json/);
    });

    it('should contain status healthy in body', async () => {
      const res = await request(app).get('/');
      expect(res.body.status).toBe('healthy');
    });
  });

  // --- 2. SECURITY HEADERS (3 Tests) ---
  describe('Security Headers & Middlewares', () => {
    it('should enable CORS headers', async () => {
      const res = await request(app).get('/');
      expect(res.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should hide/secure server power headers', async () => {
      const res = await request(app).get('/');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });

    it('should support gzip compression headers', async () => {
      const res = await request(app).get('/');
      expect(res.headers['vary']).toContain('Accept-Encoding');
    });
  });

  // --- 3. AUTH API (6 Tests) ---
  describe('Authentication API', () => {
    it('should register a new user successfully', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: 'mockUserId123',
        name: 'John Doe',
        email: 'john@example.com',
        points: 100,
        badges: ['Eco Beginner']
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should login an existing user', async () => {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      User.findOne.mockResolvedValue({
        _id: 'mockUserId123',
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        points: 100,
        streak: 1,
        badges: ['Eco Beginner'],
        lastLoginDate: new Date(),
        save: jest.fn().mockResolvedValue(true)
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should retrieve user profile details', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.name).toBe('John Doe');
    });

    it('should simulate Google authentication successfully', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/google')
        .send({
          name: 'Eco Warrior',
          email: 'ecowarrior@gmail.com',
          profilePhoto: 'http://photo.com'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('should encrypt passwords during registration', async () => {
      const bcrypt = require('bcryptjs');
      const spy = jest.spyOn(bcrypt, 'hash');

      User.findOne.mockResolvedValue(null);

      await request(app)
        .post('/api/auth/register')
        .send({ name: 'A', email: 'a@a.com', password: 'mypassword' });

      expect(spy).toHaveBeenCalled();
    });

    it('should block profile requests with invalid tokens', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.statusCode).toBe(401);
    });
  });

  // --- 4. CALCULATOR API (3 Tests) ---
  describe('Carbon Calculator API', () => {
    it('should calculate score and save report', async () => {
      CarbonReport.countDocuments.mockResolvedValue(0);

      const res = await request(app)
        .post('/api/calculator/calculate')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          carKm: 100,
          electricityUnits: 200,
          diet: 'vegetarian'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.report.annualEstimation).toBe(5.2);
    });

    it('should retrieve calculator report history', async () => {
      CarbonReport.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { score: 5000, annualEstimation: 5.0 }
        ])
      });

      const res = await request(app)
        .get('/api/calculator/history')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.reports.length).toBeGreaterThan(0);
    });

    it('should retrieve latest report', async () => {
      CarbonReport.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue({ score: 4800, annualEstimation: 4.8 })
      });

      const res = await request(app)
        .get('/api/calculator/latest')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.report.annualEstimation).toBe(4.8);
    });
  });

  // --- 5. AI API (5 Tests) ---
  describe('Gemini AI API Engine', () => {
    it('should generate personalized recommendations', async () => {
      CarbonReport.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue({
          score: 5200,
          annualEstimation: 5.2,
          category: 'yellow',
          breakdown: { transport: 1000, energy: 2000, food: 1500, waste: 700 },
          answers: { carKm: 100, diet: 'mixed' }
        })
      });

      AIReport.create.mockResolvedValue({
        recommendations: ['Walk more'],
        monthlyGoal: 'Cut electricity 10%'
      });

      const res = await request(app)
        .get('/api/ai/recommendations')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.report.recommendations).toBeDefined();
    });

    it('should process eco chatbot queries', async () => {
      const res = await request(app)
        .post('/api/ai/chatbot')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ message: 'What is the carbon footprint of a flight?' });

      expect(res.statusCode).toBe(200);
      expect(res.body.reply).toBeDefined();
    });

    it('should analyze waste images', async () => {
      const res = await request(app)
        .post('/api/ai/analyze-image')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ image: 'data:image/png;base64,iVBORw0KGgoAAAANS' });

      expect(res.statusCode).toBe(200);
      expect(res.body.analysis.detectedObjects).toBeDefined();
    });

    it('should scan electricity bills', async () => {
      const res = await request(app)
        .post('/api/ai/scan-bill')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ image: 'data:image/png;base64,iVBORw0KGgoAAAANS' });

      expect(res.statusCode).toBe(200);
      expect(res.body.scan.unitsConsumed).toBeDefined();
    });

    it('should predict future carbon scores', async () => {
      CarbonReport.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { score: 5000, annualEstimation: 5.0 }
        ])
      });

      const res = await request(app)
        .get('/api/ai/predict')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.predictedNextMonthScore).toBeDefined();
    });
  });

  // --- 6. COMMUNITY API (3 Tests) ---
  describe('Community Forums API', () => {
    it('should create a new tip post', async () => {
      Post.create.mockResolvedValue({ _id: 'postId123', title: 'Compost!' });
      Post.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: 'postId123',
          title: 'Compost!',
          user: { name: 'Eco Man' }
        })
      });

      const res = await request(app)
        .post('/api/community/posts')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ title: 'Compost!', content: 'Use a container.' });

      expect(res.statusCode).toBe(201);
      expect(res.body.post.title).toBe('Compost!');
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
      Post.findById.mockResolvedValue({
        commentsCount: 0,
        save: jest.fn().mockResolvedValue(true)
      });
      Comment.create.mockResolvedValue({ _id: 'commentId123' });
      Comment.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          content: 'Great tip!',
          user: { name: 'A' }
        })
      });

      const res = await request(app)
        .post('/api/community/comments/postId123')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ content: 'Great tip!' });

      expect(res.statusCode).toBe(201);
      expect(res.body.comment.content).toBe('Great tip!');
    });
  });

  // --- 7. LEADERBOARD API (3 Tests) ---
  describe('Leaderboard Rankings API', () => {
    it('should fetch rankings', async () => {
      User.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([
              { name: 'Winner', points: 1500 }
            ])
          })
        })
      });

      const res = await request(app)
        .get('/api/leaderboard')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.leaderboard[0].name).toBe('Winner');
    });

    it('should filter leaderboard by weekly active users', async () => {
      User.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([
              { name: 'Weekly Hero', points: 300 }
            ])
          })
        })
      });

      const res = await request(app)
        .get('/api/leaderboard?filter=weekly')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.leaderboard[0].name).toBe('Weekly Hero');
    });

    it('should filter leaderboard by daily active users', async () => {
      User.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([
              { name: 'Daily Hero', points: 150 }
            ])
          })
        })
      });

      const res = await request(app)
        .get('/api/leaderboard?filter=daily')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.leaderboard[0].name).toBe('Daily Hero');
    });
  });

  // --- 8. CHALLENGES API (3 Tests) ---
  describe('Challenges API', () => {
    it('should fetch challenges list', async () => {
      Challenge.find.mockResolvedValue([
        { title: 'Use flask', points: 50 }
      ]);

      const res = await request(app)
        .get('/api/challenges')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.challenges.length).toBe(1);
    });

    it('should auto-seed challenges when database has none', async () => {
      Challenge.find
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ title: 'Seeded Challenge 1' }]);
      Challenge.insertMany.mockResolvedValue(true);

      const res = await request(app)
        .get('/api/challenges')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(Challenge.insertMany).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
    });

    it('should complete challenge and award points', async () => {
      Challenge.findById.mockResolvedValue({ _id: 'ch1', points: 50 });

      const res = await request(app)
        .post('/api/challenges/complete/ch1')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.pointsEarned).toBe(50);
    });
  });

  // --- 9. HABITS API (2 Tests) ---
  describe('Habits Tracking API', () => {
    it('should retrieve habit trackers list', async () => {
      Habit.find.mockResolvedValue([
        { name: 'Reusable flask', streak: 5 }
      ]);

      const res = await request(app)
        .get('/api/habits')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.habits[0].name).toBe('Reusable flask');
    });

    it('should toggle habit completed date status', async () => {
      Habit.findOne.mockResolvedValue({
        name: 'Reusable flask',
        completedDates: [],
        streak: 0,
        save: jest.fn().mockResolvedValue(true)
      });

      const res = await request(app)
        .post('/api/habits/toggle')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ habitId: 'habit123', date: '2026-06-09' });

      expect(res.statusCode).toBe(200);
      expect(res.body.completed).toBe(true);
      expect(res.body.pointsEarned).toBe(10);
    });
  });

  // --- 10. INPUT VALIDATION (4 Tests) ---
  describe('Input Safety & Validation', () => {
    it('should block input exceeding length limits (>1000 characters)', async () => {
      const veryLongString = 'A'.repeat(1001);
      const res = await request(app)
        .post('/api/community/posts')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ title: 'T', content: veryLongString });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Input too long');
    });

    it('should validate email format during register', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User', email: 'invalid-email', password: 'password' });

      expect(res.statusCode).toBe(400);
    });

    it('should validate password length (>5 characters)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User', email: 'valid@e.com', password: '123' });

      expect(res.statusCode).toBe(400);
    });

    it('should block request parameter pollution (mongoSanitize check)', async () => {
      User.findOne.mockResolvedValue(null);
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'SanitizeTest',
          email: { '$gt': '' }, // Mongo injection object
          password: 'password123'
        });

      // Email field is an object, which should be rejected as invalid email
      expect(res.statusCode).toBe(400);
    });
  });

  // --- 11. ADMIN API (2 Tests) ---
  describe('Admin Operations restricted access', () => {
    it('should fetch platform metrics for authorized admins', async () => {
      // Return user is admin
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: 'adminUserId',
          name: 'System Admin',
          role: 'admin'
        })
      });
      User.countDocuments.mockResolvedValue(100); // total users
      User.aggregate.mockResolvedValue([{ total: 500 }]);
      Challenge.countDocuments.mockResolvedValue(6);

      // Generate admin token
      const jwt = require('jsonwebtoken');
      const adminToken = jwt.sign({ id: 'adminUserId' }, process.env.JWT_SECRET || 'supersecret_ecotrack_jwt_key');

      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.analytics.totalUsers).toBe(100);
    });

    it('should reject non-admin users attempting admin routes', async () => {
      // User is normal user
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: 'mockUserId123',
          name: 'Normal User',
          role: 'user'
        })
      });

      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
