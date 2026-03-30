import { describe, it, expect } from 'vitest';

describe('OAuth State Parsing', () => {
  it('should parse state with returnPath correctly', () => {
    const redirectUri = 'http://localhost:3000/api/oauth/callback';
    const returnPath = '/dashboard';
    const state = Buffer.from(JSON.stringify({ redirectUri, returnPath })).toString('base64');

    // Decode and verify
    const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    expect(decoded.redirectUri).toBe(redirectUri);
    expect(decoded.returnPath).toBe(returnPath);
  });

  it('should default to /dashboard if state parsing fails', () => {
    const invalidState = 'invalid-base64-data';
    let returnPath = '/dashboard';

    try {
      const stateData = JSON.parse(Buffer.from(invalidState, 'base64').toString('utf-8'));
      if (stateData.returnPath) {
        returnPath = stateData.returnPath;
      }
    } catch (e) {
      // Default stays as /dashboard
    }

    expect(returnPath).toBe('/dashboard');
  });

  it('should handle custom returnPath like /triage', () => {
    const redirectUri = 'http://localhost:3000/api/oauth/callback';
    const returnPath = '/triage';
    const state = Buffer.from(JSON.stringify({ redirectUri, returnPath })).toString('base64');

    const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    expect(decoded.returnPath).toBe('/triage');
  });
});
