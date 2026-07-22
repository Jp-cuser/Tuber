import { evaluateAccess } from '@/lib/access-policy/access-policy';
import { parseServerEnv } from '@/lib/env/server';

const base = parseServerEnv({ NODE_ENV: 'test' });

describe('evaluateAccess', () => {
  it('blocks writes in disabled mode', () => {
    expect(
      evaluateAccess(
        { headers: { host: '127.0.0.1:3000' }, requiresWrite: true },
        base,
      ),
    ).toMatchObject({ allowed: false, status: 403 });
  });
  it('requires the protected bearer token', () => {
    const env = parseServerEnv({
      NODE_ENV: 'test',
      ACCESS_MODE: 'protected',
      ACCESS_TOKEN: 'a-secure-token-123',
    });
    expect(
      evaluateAccess(
        { headers: { authorization: 'Bearer a-secure-token-123' } },
        env,
      ).allowed,
    ).toBe(true);
    expect(evaluateAccess({ headers: {} }, env).allowed).toBe(false);
  });
  it('rejects an unknown demo origin', () => {
    const env = parseServerEnv({
      NODE_ENV: 'test',
      ACCESS_MODE: 'demo',
      ALLOWED_ORIGINS: 'https://allowed.example',
    });
    expect(
      evaluateAccess(
        { headers: { origin: 'https://evil.example', host: 'localhost:3000' } },
        env,
      ).status,
    ).toBe(403);
  });
});
