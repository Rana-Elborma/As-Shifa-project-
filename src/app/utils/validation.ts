/** Returns a 0–100 password strength score. */
export function calculatePasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
  if (password.match(/\d/)) strength += 25;
  if (password.match(/[^a-zA-Z\d]/)) strength += 25;
  return strength;
}

/** Returns true if the email format is valid. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Returns true if the phone contains only allowed characters. */
export function isValidPhone(phone: string): boolean {
  return /^[\d\s+\-()]+$/.test(phone);
}
