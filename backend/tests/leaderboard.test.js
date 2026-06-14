const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

jest.mock('../models/User');

describe('EcoTrack AI - Leaderboard Rankings API', () => {
  let mockToken = '';
  let mockUserObj = {};

  beforeEach(() => {
    mockToken = jwt.sign({ id: 'mockUserId123' }, env.JWT_SECRET);
    mockUserObj = {
      _id: 'mockUserId123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      points: 100,
      save: jest.fn().mockResolvedValue(true)
    };

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

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
