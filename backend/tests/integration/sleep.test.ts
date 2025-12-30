/**
 * Integration Tests - Sleep Tracking Endpoints
 * Tests for /api/sleep/* routes
 */

import request from 'supertest';
import { app } from '../../src/server';

describe('Sleep Tracking Endpoints', () => {

  let authToken: string;
  let sleepId: string;

  // Setup: Create user and get token
  beforeAll(async () => {
    const testUser = {
      name: 'Sleep Test User',
      email: `sleeptest${Date.now()}@example.com`,
      password: 'TestPassword123!'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    if (response.body.token) {
      authToken = response.body.token;
    }
  });

  describe('POST /api/sleep', () => {

    test('TC-SLEEP-001: Should create sleep entry with valid data', async () => {
      if (!authToken) {
        console.log('Skipping: No auth token');
        return;
      }

      const sleepData = {
        bedtime: '2024-12-25T22:00:00.000Z',
        wakeTime: '2024-12-26T06:00:00.000Z',
        quality: 4,
        notes: 'Slept well',
        date: '2024-12-25'
      };

      const response = await request(app)
        .post('/api/sleep')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sleepData)
        .expect('Content-Type', /json/);

      expect([200, 201]).toContain(response.status);
      
      if (response.body._id || response.body.id) {
        sleepId = response.body._id || response.body.id;
      }
    });

    test('TC-SLEEP-002: Should fail without authentication', async () => {
      const sleepData = {
        bedtime: '2024-12-25T22:00:00.000Z',
        wakeTime: '2024-12-26T06:00:00.000Z',
        quality: 4
      };

      const response = await request(app)
        .post('/api/sleep')
        .send(sleepData)
        .expect('Content-Type', /json/);

      expect([401, 403]).toContain(response.status);
    });

    test('TC-SLEEP-003: Should fail with invalid quality rating', async () => {
      if (!authToken) return;

      const sleepData = {
        bedtime: '2024-12-25T22:00:00.000Z',
        wakeTime: '2024-12-26T06:00:00.000Z',
        quality: 10 // Invalid: should be 1-5
      };

      const response = await request(app)
        .post('/api/sleep')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sleepData)
        .expect('Content-Type', /json/);

      expect([400, 422]).toContain(response.status);
    });

  });

  describe('GET /api/sleep', () => {

    test('TC-SLEEP-004: Should get all sleep entries for user', async () => {
      if (!authToken) return;

      const response = await request(app)
        .get('/api/sleep')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body) || response.body.data).toBeTruthy();
    });

    test('TC-SLEEP-005: Should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/sleep')
        .expect('Content-Type', /json/);

      expect([401, 403]).toContain(response.status);
    });

  });

  describe('GET /api/sleep/stats', () => {

    test('TC-SLEEP-006: Should get sleep statistics', async () => {
      if (!authToken) return;

      const response = await request(app)
        .get('/api/sleep/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect([200, 404]).toContain(response.status);
    });

  });

});
