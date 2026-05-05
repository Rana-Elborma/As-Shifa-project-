import * as OTPAuth from 'otpauth';

// ──────────────────────────────────────────────────────────
// TOTP helpers — generates secrets, builds otpauth URIs,
// and verifies 6-digit codes from Google Authenticator.
//
// Secrets are AES-GCM encrypted before being persisted so
// that even a database leak won't expose raw TOTP secrets.
// The encryption key is derived from the user's password
// via PBKDF2 (100 000 iterations, SHA-256).
// ──────────────────────────────────────────────────────────

const ISSUER = 'As-Shifa Healthcare';

/** Generate a new random Base-32 TOTP secret (20 bytes / 160 bits). */
export function generateSecret(): string {
  const secret = new OTPAuth.Secret({ size: 20 });
  return secret.base32;
}

/**
 * Build the `otpauth://totp/…` URI that Google Authenticator scans.
 * @param secret  Base-32 encoded secret
 * @param email   The user's email (used as the account label)
 */
export function getTOTPUri(secret: string, email: string): string {
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
  return totp.toString();
}

/**
 * Verify a 6-digit token against a TOTP secret.
 * Allows ±1 time-step (30 s) to tolerate minor clock drift.
 * @returns `true` if the token is valid.
 */
export function verifyTOTP(secret: string, token: string): boolean {
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  // delta === null means invalid; otherwise it's the time-step offset
  const delta = totp.validate({ token, window: 1 });
  return delta !== null;
}

// ──────────────────────────────────────────────────────────
//  AES-GCM encryption / decryption  (Web Crypto API)
// ──────────────────────────────────────────────────────────

/** Encode a UTF-8 string to bytes. */
const encode = (s: string) => new TextEncoder().encode(s);

/** Derive a 256-bit AES key from a password + salt via PBKDF2. */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/** Convert a byte array to a hex string. */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Convert a hex string to a byte array. */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Encrypt a TOTP secret with AES-GCM using the user's password.
 * Returns a hex string in the format: `salt(32)$iv(24)$ciphertext(…)`.
 */
export async function encryptSecret(plainSecret: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encode(plainSecret)),
  );

  return `${bytesToHex(salt)}$${bytesToHex(iv)}$${bytesToHex(ciphertext)}`;
}

/**
 * Decrypt an AES-GCM encrypted TOTP secret using the user's password.
 * @param encrypted  The `salt$iv$ciphertext` hex string produced by `encryptSecret`.
 */
export async function decryptSecret(encrypted: string, password: string): Promise<string> {
  const [saltHex, ivHex, ciphertextHex] = encrypted.split('$');
  const salt = hexToBytes(saltHex);
  const iv = hexToBytes(ivHex);
  const ciphertext = hexToBytes(ciphertextHex);
  const key = await deriveKey(password, salt);

  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder().decode(plaintext);
}
