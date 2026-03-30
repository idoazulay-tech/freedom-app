import crypto from 'crypto';

/**
 * WebAuthn credential storage structure
 */
export interface WebAuthnCredential {
  id: string; // Credential ID (base64url)
  publicKey: string; // Public key (base64url)
  counter: number; // Counter for replay attack prevention
  transports?: string[]; // USB, NFC, BLE, internal
  createdAt: number; // Timestamp
}

/**
 * Generate WebAuthn registration challenge
 */
export function generateRegistrationChallenge(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Generate WebAuthn authentication challenge
 */
export function generateAuthenticationChallenge(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Verify WebAuthn registration response
 * In production, use a library like @simplewebauthn/server
 */
export function verifyRegistrationResponse(
  challenge: string,
  credentialId: string,
  publicKey: string,
  clientData: string,
  attestationObject: string
): boolean {
  // This is a simplified verification
  // In production, use proper WebAuthn verification library
  try {
    // Decode clientData
    const clientDataBuffer = Buffer.from(clientData, 'base64url');
    const clientDataJSON = JSON.parse(clientDataBuffer.toString('utf8'));

    // Verify challenge
    if (clientDataJSON.challenge !== challenge) {
      console.error('[WebAuthn] Challenge mismatch');
      return false;
    }

    // Verify type
    if (clientDataJSON.type !== 'webauthn.create') {
      console.error('[WebAuthn] Invalid type');
      return false;
    }

    return true;
  } catch (error) {
    console.error('[WebAuthn] Registration verification failed:', error);
    return false;
  }
}

/**
 * Verify WebAuthn authentication response
 */
export function verifyAuthenticationResponse(
  challenge: string,
  credentialId: string,
  storedPublicKey: string,
  storedCounter: number,
  clientData: string,
  authenticatorData: string,
  signature: string
): { valid: boolean; newCounter?: number } {
  try {
    // Decode clientData
    const clientDataBuffer = Buffer.from(clientData, 'base64url');
    const clientDataJSON = JSON.parse(clientDataBuffer.toString('utf8'));

    // Verify challenge
    if (clientDataJSON.challenge !== challenge) {
      console.error('[WebAuthn] Challenge mismatch');
      return { valid: false };
    }

    // Verify type
    if (clientDataJSON.type !== 'webauthn.get') {
      console.error('[WebAuthn] Invalid type');
      return { valid: false };
    }

    // Decode authenticator data
    const authenticatorDataBuffer = Buffer.from(authenticatorData, 'base64url');

    // Extract counter (last 4 bytes)
    const counter = authenticatorDataBuffer.readUInt32BE(authenticatorDataBuffer.length - 4);

    // Verify counter is greater than stored counter (prevents replay attacks)
    if (counter <= storedCounter) {
      console.error('[WebAuthn] Counter verification failed - possible replay attack');
      return { valid: false };
    }

    // In production, verify signature using stored public key
    // This requires proper cryptographic verification

    return { valid: true, newCounter: counter };
  } catch (error) {
    console.error('[WebAuthn] Authentication verification failed:', error);
    return { valid: false };
  }
}

/**
 * Store WebAuthn credential
 */
export function storeWebAuthnCredential(
  credentialId: string,
  publicKey: string,
  counter: number,
  transports?: string[]
): WebAuthnCredential {
  return {
    id: credentialId,
    publicKey,
    counter,
    transports,
    createdAt: Date.now(),
  };
}

/**
 * Serialize WebAuthn credentials to JSON for storage
 */
export function serializeCredentials(credentials: WebAuthnCredential[]): string {
  return JSON.stringify(credentials);
}

/**
 * Deserialize WebAuthn credentials from JSON
 */
export function deserializeCredentials(json: string): WebAuthnCredential[] {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('[WebAuthn] Failed to deserialize credentials:', error);
    return [];
  }
}
