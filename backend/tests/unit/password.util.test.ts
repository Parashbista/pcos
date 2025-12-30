/**
 * Unit Tests - Password Utility Functions
 * Tests for password hashing and comparison
 */

import { hashPassword, comparePassword } from '../../src/utils/password.util';

describe('Password Utility Functions', () => {
  
  describe('hashPassword', () => {
    
    test('should hash a password successfully', async () => {
      const password = 'TestPassword123';
      const hashedPassword = await hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    test('should generate different hashes for same password', async () => {
      const password = 'TestPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      // Due to salt, same password should produce different hashes
      expect(hash1).not.toBe(hash2);
    });

    test('should handle empty password', async () => {
      const password = '';
      const hashedPassword = await hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
    });

    test('should handle special characters in password', async () => {
      const password = 'Test@#$%^&*()123!';
      const hashedPassword = await hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
    });

  });

  describe('comparePassword', () => {
    
    test('should return true for matching password', async () => {
      const password = 'TestPassword123';
      const hashedPassword = await hashPassword(password);
      
      const isMatch = await comparePassword(password, hashedPassword);
      
      expect(isMatch).toBe(true);
    });

    test('should return false for non-matching password', async () => {
      const password = 'TestPassword123';
      const wrongPassword = 'WrongPassword456';
      const hashedPassword = await hashPassword(password);
      
      const isMatch = await comparePassword(wrongPassword, hashedPassword);
      
      expect(isMatch).toBe(false);
    });

    test('should return false for empty password comparison', async () => {
      const password = 'TestPassword123';
      const hashedPassword = await hashPassword(password);
      
      const isMatch = await comparePassword('', hashedPassword);
      
      expect(isMatch).toBe(false);
    });

    test('should handle case-sensitive passwords', async () => {
      const password = 'TestPassword123';
      const hashedPassword = await hashPassword(password);
      
      const isMatchLower = await comparePassword('testpassword123', hashedPassword);
      const isMatchUpper = await comparePassword('TESTPASSWORD123', hashedPassword);
      
      expect(isMatchLower).toBe(false);
      expect(isMatchUpper).toBe(false);
    });

  });

});
