import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCODING = 'hex';
const AUTH_TAG_LENGTH = 16;
const IV_LENGTH = 12;

/**
 * Encryption key should be 32 bytes (256 bits) for AES-256
 * In production, this should be loaded from a secure key management service
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  // Ensure key is 32 bytes
  const keyBuffer = Buffer.from(key, 'hex');
  if (keyBuffer.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters) for AES-256');
  }
  return keyBuffer;
}

/**
 * Encrypt sensitive data using AES-256-GCM
 * Returns: iv:authTag:encryptedData (all in hex format)
 */
export function encryptData(plaintext: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', ENCODING);
    encrypted += cipher.final(ENCODING);

    const authTag = cipher.getAuthTag();

    // Return: iv:authTag:encryptedData
    return `${iv.toString(ENCODING)}:${authTag.toString(ENCODING)}:${encrypted}`;
  } catch (error) {
    console.error('[Encryption] Error encrypting data:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data encrypted with encryptData
 * Expects format: iv:authTag:encryptedData (all in hex format)
 */
export function decryptData(encryptedString: string): string {
  try {
    const key = getEncryptionKey();
    const parts = encryptedString.split(':');

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], ENCODING);
    const authTag = Buffer.from(parts[1], ENCODING);
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, ENCODING, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('[Encryption] Error decrypting data:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Generate a random encryption key for AES-256 (32 bytes)
 * Use this to generate the ENCRYPTION_KEY environment variable
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a password using PBKDF2 for secure storage
 */
export function hashPassword(password: string, salt?: Buffer): { hash: string; salt: string } {
  const saltBuffer = salt || crypto.randomBytes(32);
  const hash = crypto.pbkdf2Sync(password, saltBuffer, 100000, 64, 'sha512');
  return {
    hash: hash.toString('hex'),
    salt: saltBuffer.toString('hex'),
  };
}

/**
 * Verify a password against its hash
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const saltBuffer = Buffer.from(salt, 'hex');
  const { hash: newHash } = hashPassword(password, saltBuffer);
  return newHash === hash;
}

/**
 * Generate a random token for verification/reset links
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a token for secure storage (one-way)
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
