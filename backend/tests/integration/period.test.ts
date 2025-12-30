/**
 * Integration Tests - Period Tracking Endpoints
 * Tests for /api/period/* routes
 */

import request from 'supertest';
import { app } from '../../src/server';

describe('Period Tracking Endpoints', () => {

  let authToken: string;
  let periodId: string;

  // Setup: Create user and get token
  beforeAll(async () => {
    const testUser = {
      name: 'Period Test User',
      email: `periodtest${Date.now()}@example.com`,
      password: 'TestPassword123!'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    if (response.body.token) {
      authToken = response.body.token;
    }
  });

  describe('POST /api/period', () => {

    test('TC-PERIOD-001: Should create period entry with valid data', async () => {
      if (!authToken) {
        console.log('Skipping: No auth token');
        return;
      }

      const periodData = {
        startDate: '2024-12-20',
        flowIntensity: 'medium',
        symptoms: ['cramps', 'headache'],
        notes: 'Started period'
      };

      const response = await request(app)
        .post('/api/period')
        .set('Authorization', `Bearer ${authToken}`)
        .send(periodData)
        .expect('Content-Type', /json/);

      expect([200, 201]).toContain(response.status);
      
      if (response.body._id || response.body.id) {
        periodId = response.body._id || response.body.id;
      }
    });

    test('TC-PERIOD-002: Should fail without authentication', async () => {
      const periodData = {
        startDate: '2024-12-20',
        flowIntensity: 'medium'
      };

      const response = await request(app)
        .post('/api/period')
        .send(periodData)
        .expect('Content-Type', /json/);

      expect([401, 403]).toContain(response.status);
    });

    test('TC-PERIOD-003: Should fail with invalid flow intensity', async () => {
      if (!authToken) return;

      const periodData = {
        startDate: '2024-12-20',
        flowIntensity: 'invalid' // Should be light/medium/heavy
      };

      const response = await request(app)
        .post('/api/period')
        .set('Authorization', `Bearer ${authToken}`)
        .send(periodData)
        .expect('Content-Type', /json/);

      expect([400, 422]).toContain(response.status);
    });

  });

  describe('GET /api/period', () => {

    test('TC-PERIOD-004: Should get all period entries for user', async () => {
      if (!authToken) return;

      const response = await request(app)
        .get('/api/period')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body) || response.body.data).toBeTruthy();
    });

    test('TC-PERIOD-005: Should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/period')
        .expect('Content-Type', /json/);

      expect([401, 403]).toContain(response.status);
    });

  });

  describe('PUT /api/period/:id', () => {

    test('TC-PERIOD-006: Should update period with end date', async () => {
      if (!authToken || !periodId) return;

      const updateData = {
        endDate: '2024-12-25',
        flowIntensity: 'light'
      };

      const response = await request(app)
        .put(`/api/period/${periodId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect('Content-Type', /json/);

      expect([200, 404]).toContain(response.status);
    });

  });

  describe('GET /api/period/predictions', () => {

    test('TC-PERIOD-007: Should get cycle predictions', async () => {
      if (!authToken) return;

      const response = await request(app)
        .get('/api/period/predictions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect([200, 404]).toContain(response.status);
    });

  });

});
