const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

jest.mock('../models/User');

describe('EcoTrack AI - Security Headers & Threat Models', () => {
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

  it('should enable CORS headers', async () => {
    const res = await request(app).get('/').set('Origin', 'http://localhost:5173');
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

  it('should return Helmet security headers', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  it('should return Rate Limiter headers', async () => {
    const res = await request(app).get('/');
    expect(res.headers['ratelimit-limit']).toBeDefined();
    expect(res.headers['ratelimit-remaining']).toBeDefined();
  });

  it('should render Swagger OpenAPI documentation endpoint html', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('html');
  });

  it('should verify winston logger configuration exists', () => {
    const loggerInstance = require('../utils/logger');
    expect(loggerInstance).toBeDefined();
    expect(loggerInstance.info).toBeDefined();
  });

  // EXPANDED SECURITY TESTS
  it('should block profile requests with invalid JWT tokens', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalid_token');
    expect(res.statusCode).toBe(401);
  });

  it('should block profile requests with expired JWT tokens', async () => {
    const expiredToken = jwt.sign({ id: 'mockUserId123' }, env.JWT_SECRET, { expiresIn: '0s' });
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.statusCode).toBe(401);
  });

  it('should reject requests with NoSQL Injection patterns', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: { "$ne": null },
        password: "anypassword"
      });
    expect(res.statusCode).toBe(400); // Validation failure / Zod blocks object in email field
  });

  it('should block chatbot requests with input exceeding safety limit', async () => {
    const veryLongString = 'A'.repeat(1001);
    const res = await request(app)
      .post('/api/community/posts')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ title: 'T', content: veryLongString });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Input too long');
  });

  it('should reject content-type text/plain on post json endpoints', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'text/plain')
      .send('name=John&email=john@example.com&password=password123');
    expect(res.statusCode).toBe(400); // No JSON body parsed -> schema missing fields -> 400
  });

  it('should reject chatbot queries with missing required fields', async () => {
    const res = await request(app)
      .post('/api/ai/chatbot')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({}); // missing message
    expect(res.statusCode).toBe(400);
  });
});
