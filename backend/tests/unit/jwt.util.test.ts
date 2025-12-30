/**
 * Unit Tests - JWT Utility Functions
 * Tests for JWT token generation and verification
 */

import { generateToken, verifyToken } from '../../src/utils/jwt.util';

describe('JWT Utility Functions', () => {
  const mockUserId = '507f1f77bcf86cd799439011';

  describe('generateToken', () => {
    test('should generate a valid JWT token', () => {
      const token = generateToken(mockUserId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    test('should generate different tokens for different users', () => {
      const userId1 = '507f1f77bcf86cd799439011';
      const userId2 = '507f1f77bcf86cd799439012';

      const token1 = generateToken(userId1);
      const token2 = generateToken(userId2);

      expect(token1).not.toBe(token2);
    });

    test('should generate token with correct structure', () => {
      const token = generateToken(mockUserId);
      const parts = token.split('.');

      // Header
      expect(parts[0]).toBeDefined();
      // Payload
      expect(parts[1]).toBeDefined();
      // Signature
      expect(parts[2]).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    test('should verify a valid token and return payload', () => {
      const token = generateToken(mockUserId);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockUserId);
    });

    test('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => verifyToken(invalidToken)).toThrow();
    });

    test('should throw error for tampered token', () => {
      const token = generateToken(mockUserId);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';

      expect(() => verifyToken(tamperedToken)).toThrow();
    });

    test('should throw error for empty token', () => {
      expect(() => verifyToken('')).toThrow();
    });
  });

  describe('Token Round Trip', () => {
    test('should generate and verify token successfully', () => {
      const userId = '507f1f77bcf86cd799439011';

      // Generate token
      const token = generateToken(userId);
      expect(token).toBeDefined();

      // Verify token
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(userId);
    });
  });
});
