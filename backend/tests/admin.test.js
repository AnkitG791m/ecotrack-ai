const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

jest.mock('../models/User');
jest.mock('../models/Challenge');

describe('EcoTrack AI - Admin API Operations', () => {
  let mockToken = '';

  beforeEach(() => {
    mockToken = jwt.sign({ id: 'mockUserId123' }, env.JWT_SECRET);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch platform metrics for authorized admins', async () => {
    // Return user is admin
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'adminUserId',
        name: 'System Admin',
        role: 'admin'
      })
    });
    User.countDocuments.mockResolvedValue(100);
    User.aggregate.mockResolvedValue([{ total: 500 }]);
    Challenge.countDocuments.mockResolvedValue(6);

    const adminToken = jwt.sign({ id: 'adminUserId' }, env.JWT_SECRET);

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
