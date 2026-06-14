const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const bcrypt = require('bcryptjs');

jest.mock('../models/User');

describe('EcoTrack AI - Authentication API', () => {
  let mockToken = '';
  let mockUserObj = {};

  beforeEach(() => {
    mockToken = jwt.sign({ id: 'mockUserId123' }, env.JWT_SECRET);
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

    // Default mocks
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

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
    expect(res.body.token).toBeDefined();
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
    const spy = jest.spyOn(bcrypt, 'hash');
    User.findOne.mockResolvedValue(null);

    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alex', email: 'alex@example.com', password: 'mypassword' });

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should reject registration with invalid email format (Zod check)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Valid Name', email: 'invalid-email-format', password: 'password123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('should reject registration with short passwords (Zod check)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Valid Name', email: 'valid@e.com', password: '123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('should reject registration with missing name (Zod check)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'valid@e.com', password: 'password123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('should reject login with invalid email format (Zod check)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bademail', password: 'password123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('should reject login with missing password (Zod check)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'valid@e.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('should reject simulated Google login with invalid details (Zod check)', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({ name: 'Google User' }); // missing email

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
