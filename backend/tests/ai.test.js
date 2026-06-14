const request = require('supertest');
const app = require('../server');
const CarbonReport = require('../models/CarbonReport');
const AIReport = require('../models/AIReport');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

jest.mock('../models/CarbonReport');
jest.mock('../models/AIReport');
jest.mock('../models/User');

describe('EcoTrack AI - Gemini AI API Engine', () => {
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

  it('should generate personalized recommendations', async () => {
    CarbonReport.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue({
        _id: 'reportId123',
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

  it('should block chatbot queries with empty message (edge case)', async () => {
    const res = await request(app)
      .post('/api/ai/chatbot')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
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
