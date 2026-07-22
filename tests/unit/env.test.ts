import { parseServerEnv } from '@/lib/env/server';

describe('parseServerEnv', () => {
  it('uses secure local defaults', () => {
    expect(parseServerEnv({ NODE_ENV: 'test' })).toMatchObject({
      ACCESS_MODE: 'disabled',
      TRUST_PROXY: false,
    });
  });
  it('requires a sufficiently long protected token', () => {
    expect(() =>
      parseServerEnv({ NODE_ENV: 'test', ACCESS_MODE: 'protected' }),
    ).toThrow('ACCESS_TOKEN');
  });
});
