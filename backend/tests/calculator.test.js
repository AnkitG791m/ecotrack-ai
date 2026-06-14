const request = require('supertest');
const app = require('../server');
const CarbonReport = require('../models/CarbonReport');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

jest.mock('../models/CarbonReport');
jest.mock('../models/User');

describe('EcoTrack AI - Carbon Calculator API', () => {
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

    // Mongoose query mocks
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

    CarbonReport.create.mockResolvedValue({
      _id: 'reportId123',
      score: 5200,
      annualEstimation: 5.2,
      category: 'yellow',
      transportScore: 1000,
      energyScore: 2000,
      foodScore: 1500,
      wasteScore: 700,
      answers: { carKm: 100, electricityUnits: 200, diet: 'vegetarian' }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

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

  it('should reject carbon calculator requests with empty payload (edge case)', async () => {
    const res = await request(app)
      .post('/api/calculator/calculate')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject carbon calculator requests with incorrect types (Zod check)', async () => {
    const res = await request(app)
      .post('/api/calculator/calculate')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        carKm: "one-hundred", // should be number
        electricityUnits: 200,
        diet: 'vegetarian'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });
});
