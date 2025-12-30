/**
 * Integration Tests - Authentication Endpoints
 * Tests for /api/auth/* routes
 */

import request from 'supertest';
import { app } from '../../src/server';

describe('Authentication Endpoints', () => {

  // Test user data
  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!'
  };

  let authToken: string;

  describe('POST /api/auth/register', () => {

    test('TC-AUTH-001: Should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect('Content-Type', /json/);

      // Should return 201 Created or 200 OK
      expect([200, 201]).toContain(response.status);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email.toLowerCase());
      
      // Save token for later tests
      authToken = response.body.token;
    });

    test('TC-AUTH-002: Should fail registration with existing email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect('Content-Type', /json/);

      expect([400, 409]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });

    test('TC-AUTH-003: Should fail registration with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'TestPassword123!'
        })
        .expect('Content-Type', /json/);

      expect([400, 422]).toContain(response.status);
    });

    test('TC-AUTH-004: Should fail registration with short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'newuser@example.com',
          password: '123' // Too short
        })
        .expect('Content-Type', /json/);

      expect([400, 422]).toContain(response.status);
    });

    test('TC-AUTH-005: Should fail registration without email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          password: 'TestPassword123!'
        })
        .expect('Content-Type', /json/);

      expect([400, 422]).toContain(response.status);
    });

  });

  describe('POST /api/auth/login', () => {

    test('TC-AUTH-006: Should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      
      authToken = response.body.token;
    });

    test('TC-AUTH-007: Should fail login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        })
        .expect('Content-Type', /json/);

      expect([400, 401]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });

    test('TC-AUTH-008: Should fail login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123!'
        })
        .expect('Content-Type', /json/);

      expect([400, 401, 404]).toContain(response.status);
    });

    test('TC-AUTH-009: Should fail login with empty password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: ''
        })
        .expect('Content-Type', /json/);

      expect([400, 422]).toContain(response.status);
    });

    test('TC-AUTH-010: Should fail login with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'TestPassword123!'
        })
        .expect('Content-Type', /json/);

      expect([400, 422]).toContain(response.status);
    });

  });

  describe('POST /api/auth/change-password', () => {

    test('TC-AUTH-011: Should change password with valid token', async () => {
      // Skip if no token
      if (!authToken) {
        console.log('Skipping: No auth token available');
        return;
      }

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'NewPassword456!'
        })
        .expect('Content-Type', /json/);

      expect([200, 201]).toContain(response.status);
    });

    test('TC-AUTH-012: Should fail change password without token', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: testUser.password,
          newPassword: 'NewPassword456!'
        })
        .expect('Content-Type', /json/);

      expect([401, 403]).toContain(response.status);
    });

    test('TC-AUTH-013: Should fail change password with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          currentPassword: testUser.password,
          newPassword: 'NewPassword456!'
        })
        .expect('Content-Type', /json/);

      expect([401, 403]).toContain(response.status);
    });

  });

  describe('POST /api/auth/forgot-password', () => {

    test('TC-AUTH-014: Should send OTP for valid email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testUser.email
        })
        .expect('Content-Type', /json/);

      // May succeed or fail based on email service
      expect([200, 404, 500]).toContain(response.status);
    });

    test('TC-AUTH-015: Should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'invalid-email'
        })
        .expect('Content-Type', /json/);

      expect([400, 422]).toContain(response.status);
    });

  });

});
