import { InMemoryRateLimiter } from '@/lib/security/rate-limit';

describe('InMemoryRateLimiter', () => {
  it('limits within a window and resets afterward', () => {
    const limiter = new InMemoryRateLimiter(1, 1000);
    expect(limiter.consume('client', 0).allowed).toBe(true);
    expect(limiter.consume('client', 1).allowed).toBe(false);
    expect(limiter.consume('client', 1000).allowed).toBe(true);
  });
});
