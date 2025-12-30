/**
 * Integration Tests - Health Check Endpoint
 * Tests for /health route
 */

import request from 'supertest';
import { app } from '../../src/server';

describe('Health Check Endpoint', () => {

  describe('GET /health', () => {

    test('Should return 200 OK with status info', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    test('Should return valid timestamp format', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });

    test('Should return positive uptime', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });

  });

});
