import crypto from 'crypto';

/**
 * Generate a TOTP secret for 2FA
 */
export function generateTOTPSecret(): string {
  return crypto.randomBytes(32).toString('base64');
}

/**
 * Generate TOTP code from secret
 * Uses HMAC-SHA1 with 30-second time steps (RFC 6238)
 */
export function generateTOTPCode(secret: string, time: number = Date.now()): string {
  const timeStep = Math.floor(time / 30000); // 30 second time step
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(timeStep), 0);

  // Decode base64 secret
  const secretBuffer = Buffer.from(secret, 'base64');

  // Generate HMAC
  const hmac = crypto.createHmac('sha1', secretBuffer);
  hmac.update(timeBuffer);
  const digest = hmac.digest();

  // Extract 4-byte code from digest
  const offset = digest[digest.length - 1] & 0x0f;
  const code = digest.readUInt32BE(offset) & 0x7fffffff;

  // Return 6-digit code
  return String(code % 1000000).padStart(6, '0');
}

/**
 * Verify TOTP code
 * Allows for time drift (±1 time step)
 */
export function verifyTOTPCode(secret: string, code: string, time: number = Date.now()): boolean {
  const currentCode = generateTOTPCode(secret, time);

  // Check current time step
  if (code === currentCode) {
    return true;
  }

  // Check previous time step (30 seconds ago)
  const previousCode = generateTOTPCode(secret, time - 30000);
  if (code === previousCode) {
    return true;
  }

  // Check next time step (30 seconds ahead)
  const nextCode = generateTOTPCode(secret, time + 30000);
  if (code === nextCode) {
    return true;
  }

  return false;
}

/**
 * Generate QR code data URL for TOTP setup
 * This returns the otpauth:// URL that can be converted to QR code
 */
export function generateTOTPQRCodeURL(
  secret: string,
  email: string,
  issuer: string = 'Freedom'
): string {
  const encodedEmail = encodeURIComponent(email);
  const encodedIssuer = encodeURIComponent(issuer);

  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}`;
}
