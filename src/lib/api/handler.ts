import { randomUUID } from 'node:crypto';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import {
  evaluateAccess,
  clientAddress,
} from '@/lib/access-policy/access-policy';
import { getServerEnv } from '@/lib/env/server';
import { AppError, toSafeError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';
import { InMemoryRateLimiter } from '@/lib/security/rate-limit';

let limiter: InMemoryRateLimiter | undefined;

export function withApiSecurity(
  handler: NextApiHandler,
  options: { methods: string[]; write?: boolean },
): NextApiHandler {
  return async (request: NextApiRequest, response: NextApiResponse) => {
    const traceId = randomUUID();
    response.setHeader('X-Trace-Id', traceId);
    try {
      if (!request.method || !options.methods.includes(request.method)) {
        response.setHeader('Allow', options.methods);
        throw new AppError('METHOD_NOT_ALLOWED', 405, 'Method not allowed');
      }
      const env = getServerEnv();
      const contentLength = Number(request.headers['content-length'] ?? 0);
      if (contentLength > env.MAX_REQUEST_BODY_BYTES)
        throw new AppError(
          'PAYLOAD_TOO_LARGE',
          413,
          'Request body is too large',
        );
      const accessRequest = {
        headers: request.headers,
        remoteAddress: request.socket.remoteAddress,
        requiresWrite: options.write,
      };
      const decision = evaluateAccess(accessRequest, env);
      if (!decision.allowed)
        throw new AppError(
          decision.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
          decision.status,
          'Access denied',
        );
      limiter ??= new InMemoryRateLimiter(
        env.RATE_LIMIT_MAX_REQUESTS,
        env.RATE_LIMIT_WINDOW_MS,
      );
      const rate = limiter.consume(clientAddress(accessRequest, env));
      response.setHeader('X-RateLimit-Remaining', rate.remaining);
      if (!rate.allowed) {
        response.setHeader('Retry-After', rate.retryAfterSeconds);
        throw new AppError('RATE_LIMITED', 429, 'Too many requests');
      }
      await handler(request, response);
    } catch (error) {
      const safe = toSafeError(error);
      logger.error('API request failed', {
        traceId,
        code: safe.code,
        status: safe.status,
        error,
      });
      response
        .status(safe.status)
        .json({ error: { code: safe.code, message: safe.message, traceId } });
    }
  };
}

export function resetApiSecurityForTests(): void {
  limiter = undefined;
}
