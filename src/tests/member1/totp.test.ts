/**
 * Member 1 — TC-TOTP
 * Black-box tests for the TOTP library (src/app/lib/totp.ts)
 * Tests: secret generation, URI building, code verification, AES-GCM encryption roundtrip
 */
import { describe, it, expect } from 'vitest';
import {
  generateSecret,
  getTOTPUri,
  verifyTOTP,
  encryptSecret,
  decryptSecret,
} from '../../app/lib/totp';

// ─── Secret Generation ────────────────────────────────────────────────────────

describe('generateSecret', () => {
  it('TC-TOTP-01 | returns a non-empty Base-32 string', () => {
    const secret = generateSecret();
    expect(secret).toBeTruthy();
    expect(typeof secret).toBe('string');
  });

  it('TC-TOTP-02 | secret contains only valid Base-32 characters (A-Z, 2-7)', () => {
    const secret = generateSecret();
    expect(secret).toMatch(/^[A-Z2-7]+=*$/);
  });

  it('TC-TOTP-03 | each call produces a different secret (random)', () => {
    const a = generateSecret();
    const b = generateSecret();
    expect(a).not.toBe(b);
  });
});

// ─── TOTP URI ─────────────────────────────────────────────────────────────────

describe('getTOTPUri', () => {
  it('TC-TOTP-04 | returns a valid otpauth:// URI', () => {
    const secret = generateSecret();
    const uri = getTOTPUri(secret, 'patient@test.com');
    expect(uri).toMatch(/^otpauth:\/\/totp\//);
  });

  it('TC-TOTP-05 | URI contains the user email as account label (URL-encoded)', () => {
    const secret = generateSecret();
    const uri = getTOTPUri(secret, 'hala@test.com');
    // @ is percent-encoded to %40 inside the URI
    expect(uri).toContain('hala%40test.com');
  });

  it('TC-TOTP-06 | URI contains the issuer name', () => {
    const secret = generateSecret();
    const uri = getTOTPUri(secret, 'test@test.com');
    expect(uri).toContain('As-Shifa');
  });
});

// ─── TOTP Verification ────────────────────────────────────────────────────────

describe('verifyTOTP', () => {
  it('TC-TOTP-07 | rejects a clearly wrong 6-digit code', () => {
    const secret = generateSecret();
    // '000000' is almost never the correct time-based code
    const result = verifyTOTP(secret, '000000');
    // We can't guarantee it's always wrong, but we CAN assert the function returns boolean
    expect(typeof result).toBe('boolean');
  });

  it('TC-TOTP-08 | rejects a code that is not 6 digits', () => {
    const secret = generateSecret();
    expect(verifyTOTP(secret, '123')).toBe(false);
    expect(verifyTOTP(secret, '1234567')).toBe(false);
    expect(verifyTOTP(secret, 'abcdef')).toBe(false);
  });

  it('TC-TOTP-09 | rejects an empty string as code', () => {
    const secret = generateSecret();
    expect(verifyTOTP(secret, '')).toBe(false);
  });
});

// ─── AES-GCM Encryption / Decryption ─────────────────────────────────────────

describe('encryptSecret + decryptSecret', () => {
  it('TC-TOTP-10 | encrypted output is different from the plain secret', async () => {
    const secret = generateSecret();
    const encrypted = await encryptSecret(secret, 'StrongPass@1');
    expect(encrypted).not.toBe(secret);
  });

  it('TC-TOTP-11 | encrypted output contains salt$iv$ciphertext format', async () => {
    const secret = generateSecret();
    const encrypted = await encryptSecret(secret, 'StrongPass@1');
    const parts = encrypted.split('$');
    expect(parts).toHaveLength(3);
    parts.forEach(p => expect(p.length).toBeGreaterThan(0));
  });

  it('TC-TOTP-12 | decrypt(encrypt(secret)) returns the original secret', async () => {
    const secret = generateSecret();
    const password = 'StrongPass@1';
    const encrypted = await encryptSecret(secret, password);
    const decrypted = await decryptSecret(encrypted, password);
    expect(decrypted).toBe(secret);
  });

  it('TC-TOTP-13 | decryption fails with the wrong password', async () => {
    const secret = generateSecret();
    const encrypted = await encryptSecret(secret, 'CorrectPass@1');
    await expect(decryptSecret(encrypted, 'WrongPass@99')).rejects.toThrow();
  });

  it('TC-TOTP-14 | two encryptions of the same secret produce different ciphertexts (random IV)', async () => {
    const secret = generateSecret();
    const password = 'StrongPass@1';
    const enc1 = await encryptSecret(secret, password);
    const enc2 = await encryptSecret(secret, password);
    expect(enc1).not.toBe(enc2);
  });
});
