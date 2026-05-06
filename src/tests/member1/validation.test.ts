/**
 * Member 1 — TC-VAL
 * Black-box tests for registration input validation (src/app/utils/validation.ts)
 * Tests: password strength, email format, phone format
 * Covers TC-02 (weak password) and part of TC-01 (valid input accepted)
 */
import { describe, it, expect } from 'vitest';
import { calculatePasswordStrength, isValidEmail, isValidPhone } from '../../app/utils/validation';

// ─── Password Strength ────────────────────────────────────────────────────────

describe('calculatePasswordStrength', () => {
  it('TC-VAL-01 | short password (< 8 chars) scores 0', () => {
    expect(calculatePasswordStrength('abc')).toBe(0);
  });

  it('TC-VAL-02 | common weak password scores ≤ 25', () => {
    // "password" — only lowercase, ≥8 chars → 25
    expect(calculatePasswordStrength('password')).toBeLessThanOrEqual(25);
  });

  it('TC-VAL-03 | password with only letters and numbers scores 75', () => {
    // Has length, mixed case, digits — but no special char
    expect(calculatePasswordStrength('Password1')).toBe(75);
  });

  it('TC-VAL-04 | strong password (length + mixed case + digit + symbol) scores 100', () => {
    expect(calculatePasswordStrength('Secure@123')).toBe(100);
  });

  it('TC-VAL-05 | password with only lowercase ≥ 8 scores 25', () => {
    expect(calculatePasswordStrength('abcdefgh')).toBe(25);
  });
});

// ─── Email Validation ─────────────────────────────────────────────────────────

describe('isValidEmail', () => {
  it('TC-VAL-06 | accepts a standard email address', () => {
    expect(isValidEmail('hala@gmail.com')).toBe(true);
  });

  it('TC-VAL-07 | accepts email with subdomain', () => {
    expect(isValidEmail('user@mail.hospital.org')).toBe(true);
  });

  it('TC-VAL-08 | rejects email missing the @ symbol', () => {
    expect(isValidEmail('halagmail.com')).toBe(false);
  });

  it('TC-VAL-09 | rejects email missing the domain', () => {
    expect(isValidEmail('hala@')).toBe(false);
  });

  it('TC-VAL-10 | rejects email with spaces', () => {
    expect(isValidEmail('hala @gmail.com')).toBe(false);
  });

  it('TC-VAL-11 | rejects empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

// ─── Phone Validation ─────────────────────────────────────────────────────────

describe('isValidPhone', () => {
  it('TC-VAL-12 | accepts a standard phone number', () => {
    expect(isValidPhone('+966501234567')).toBe(true);
  });

  it('TC-VAL-13 | accepts phone with spaces and dashes', () => {
    expect(isValidPhone('+1 (555) 000-1234')).toBe(true);
  });

  it('TC-VAL-14 | rejects phone with letters', () => {
    expect(isValidPhone('05012abc34')).toBe(false);
  });

  it('TC-VAL-15 | rejects phone with special characters', () => {
    expect(isValidPhone('050#123456')).toBe(false);
  });
});
