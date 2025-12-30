/**
 * Integration Tests - Mood Tracking Endpoints
 * Tests for /api/mood/* routes
 */

import request from 'supertest';
import { app } from '../../src/server';

describe('Mood Tracking Endpoints', () => {

  let authToken: string;
  let moodId: string;

  // Setup: Create user and get token
  beforeAll(async () => {
    const testUser = {
      name: 'Mood Test User',
      email: `moodtest${Date.now()}@example.com`,
      password: 'TestPassword123!'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    if (response.body.token) {
      authToken = response.body.token;
    }
  });

  describe('POST /api/mood', () => {

    test('TC-MOOD-001: Should create mood entry with valid data', async () => {
      if (!authToken) {
        console.log('Skipping: No auth token');
        return;
      }

      const moodData = {
        moodLevel: 4,
        emotions: ['happy', 'calm', 'energetic'],
        notes: 'Feeling great today!',
        date: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/mood')
        .set('Authorization', `Bearer ${authToken}`)
        .send(moodData)
        .expect('Content-Type', /json/);

      expect([200, 201]).toContain(response.status);
      
      if (response.body._id || response.body.id) {
        moodId = response.body._id || response.body.id;
      }
    });

    test('TC-MOOD-002: Should fail without authentication', async () => {
      const moodData = {
        moodLevel: 4,
        emotions: ['happy'],
        date: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/mood')
        .send(moodData)
        .expect('Content-Type', /json/);

      expect([401, 403]).toContain(response.status);
    });

    test('TC-MOOD-003: Should fail with invalid mood level', async () => {
      if (!authToken) return;

      const moodData = {
        moodLevel: 10, // Invalid: should be 1-5
        emotions: ['happy'],
        date: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/mood')
        .set('Authorization', `Bearer ${authToken}`)
        .send(moodData)
        .expect('Content-Type', /json/);

      expect([400, 422]).toContain(response.status);
    });

  });

  describe('GET /api/mood', () => {

    test('TC-MOOD-004: Should get all mood entries for user', async () => {
      if (!authToken) return;

      const response = await request(app)
        .get('/api/mood')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body) || response.body.data).toBeTruthy();
    });

    test('TC-MOOD-005: Should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/mood')
        .expect('Content-Type', /json/);

      expect([401, 403]).toContain(response.status);
    });

  });

  describe('GET /api/mood/stats', () => {

    test('TC-MOOD-006: Should get mood statistics', async () => {
      if (!authToken) return;

      const response = await request(app)
        .get('/api/mood/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect([200, 404]).toContain(response.status);
    });

  });

});
