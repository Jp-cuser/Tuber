import type { NextApiRequest, NextApiResponse } from 'next';
import { withApiSecurity } from '@/lib/api/handler';
import { getServerEnv } from '@/lib/env/server';

function diagnostics(
  _request: NextApiRequest,
  response: NextApiResponse,
): void {
  const env = getServerEnv();
  response.status(200).json({
    status: 'ok',
    service: 'LocalAITuber',
    runtime: { node: process.version, environment: env.NODE_ENV },
    access: { mode: env.ACCESS_MODE, trustProxy: env.TRUST_PROXY },
    timestamp: new Date().toISOString(),
  });
}

export default withApiSecurity(diagnostics, { methods: ['GET'] });
