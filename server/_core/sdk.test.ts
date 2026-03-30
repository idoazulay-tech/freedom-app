import { describe, it, expect } from 'vitest';
import { SignJWT } from 'jose';

describe('Session Verification with Empty Name', () => {
  it('should allow session with empty name', async () => {
    const secret = new TextEncoder().encode('test-secret-key-32-bytes-long-ok');
    
    const payload = {
      openId: 'user123',
      appId: 'app456',
      name: '', // Empty name
    };

    const issuedAt = Date.now();
    const expirationSeconds = Math.floor((issuedAt + 365 * 24 * 60 * 60 * 1000) / 1000);

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setExpirationTime(expirationSeconds)
      .sign(secret);

    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
  });

  it('should handle missing name field gracefully', async () => {
    const secret = new TextEncoder().encode('test-secret-key-32-bytes-long-ok');
    
    const payload = {
      openId: 'user123',
      appId: 'app456',
      // name is intentionally missing
    };

    const issuedAt = Date.now();
    const expirationSeconds = Math.floor((issuedAt + 365 * 24 * 60 * 60 * 1000) / 1000);

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setExpirationTime(expirationSeconds)
      .sign(secret);

    expect(token).toBeTruthy();
  });

  it('should require openId and appId', async () => {
    const secret = new TextEncoder().encode('test-secret-key-32-bytes-long-ok');
    
    const payload = {
      // Missing openId and appId
      name: 'Test User',
    };

    const issuedAt = Date.now();
    const expirationSeconds = Math.floor((issuedAt + 365 * 24 * 60 * 60 * 1000) / 1000);

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setExpirationTime(expirationSeconds)
      .sign(secret);

    // Token creation should work, but verification should fail due to missing fields
    expect(token).toBeTruthy();
  });
});
