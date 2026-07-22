import { createMocks } from 'node-mocks-http';
import diagnostics from '@/pages/api/diagnostics';
import { resetApiSecurityForTests } from '@/lib/api/handler';
import { resetServerEnvForTests } from '@/lib/env/server';

describe('/api/diagnostics', () => {
  beforeEach(() => {
    process.env.ACCESS_MODE = 'disabled';
    resetServerEnvForTests();
    resetApiSecurityForTests();
  });
  it('returns health data without secrets', async () => {
    process.env.ACCESS_TOKEN = 'never-return-this-secret';
    const { req, res } = createMocks({
      method: 'GET',
      headers: { host: '127.0.0.1:3000' },
    });
    await diagnostics(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toMatchObject({
      status: 'ok',
      access: { mode: 'disabled' },
    });
    expect(res._getData()).not.toContain(process.env.ACCESS_TOKEN);
  });
});
