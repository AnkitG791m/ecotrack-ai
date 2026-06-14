const request = require('supertest');
const app = require('../server');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

jest.mock('../models/Challenge');
jest.mock('../models/User');

describe('EcoTrack AI - Challenges API', () => {
  let mockToken = '';
  let mockUserObj = {};

  beforeEach(() => {
    mockToken = jwt.sign({ id: 'mockUserId123' }, env.JWT_SECRET);
    mockUserObj = {
      _id: 'mockUserId123',
      name: 'John Doe',
      points: 100,
      completedChallengesCount: 0,
      carbonSaved: 0,
      completedChallenges: [],
      badges: [],
      save: jest.fn().mockResolvedValue(true)
    };

    User.findById.mockResolvedValue(mockUserObj);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

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
