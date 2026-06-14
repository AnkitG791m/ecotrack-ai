const request = require('supertest');
const app = require('../server');
const Habit = require('../models/Habit');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

jest.mock('../models/Habit');
jest.mock('../models/User');

describe('EcoTrack AI - Habits Tracking API', () => {
  let mockToken = '';
  let mockUserObj = {};

  beforeEach(() => {
    mockToken = jwt.sign({ id: 'mockUserId123' }, env.JWT_SECRET);
    mockUserObj = {
      _id: 'mockUserId123',
      name: 'John Doe',
      points: 100,
      carbonSaved: 0,
      badges: [],
      save: jest.fn().mockResolvedValue(true)
    };

    User.findById.mockResolvedValue(mockUserObj);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

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
