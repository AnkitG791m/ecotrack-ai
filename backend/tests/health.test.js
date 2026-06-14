const request = require('supertest');
const app = require('../server');

describe('EcoTrack AI - Health Check API', () => {
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

  it('should verify health diagnostics endpoint', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('healthy');
  });

  it('should verify database health diagnostics endpoint', async () => {
    const res = await request(app).get('/api/health/db');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('healthy');
  });

  it('should verify Gemini AI health diagnostics endpoint', async () => {
    const res = await request(app).get('/api/health/ai');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
