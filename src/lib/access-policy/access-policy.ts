import type { IncomingHttpHeaders } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import type { ServerEnv } from '@/lib/env/server';
import { isOriginAllowed, parseAllowedOrigins } from '@/lib/security/origin';

export interface AccessRequest {
  headers: IncomingHttpHeaders;
  remoteAddress?: string;
  requiresWrite?: boolean;
}

export interface AccessDecision {
  allowed: boolean;
  status: number;
  reason: string;
}

function tokensMatch(
  actual: string | undefined,
  expected: string | undefined,
): boolean {
  if (!actual || !expected) return false;
  const left = Buffer.from(actual);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function bearer(headers: IncomingHttpHeaders): string | undefined {
  const value = headers.authorization;
  return value?.startsWith('Bearer ') ? value.slice(7) : undefined;
}

export function clientAddress(request: AccessRequest, env: ServerEnv): string {
  const forwarded = request.headers['x-forwarded-for'];
  if (env.TRUST_PROXY && typeof forwarded === 'string')
    return forwarded.split(',')[0]?.trim() || 'unknown';
  return request.remoteAddress || 'unknown';
}

export function evaluateAccess(
  request: AccessRequest,
  env: ServerEnv,
): AccessDecision {
  if (env.ACCESS_MODE === 'unprotected')
    return { allowed: true, status: 200, reason: 'unprotected' };
  if (env.ACCESS_MODE === 'protected') {
    return tokensMatch(bearer(request.headers), env.ACCESS_TOKEN)
      ? { allowed: true, status: 200, reason: 'valid-token' }
      : { allowed: false, status: 401, reason: 'bearer-token-required' };
  }
  const origin = Array.isArray(request.headers.origin)
    ? request.headers.origin[0]
    : request.headers.origin;
  const host = request.headers.host;
  if (
    !isOriginAllowed(origin, host, parseAllowedOrigins(env.ALLOWED_ORIGINS))
  ) {
    return { allowed: false, status: 403, reason: 'origin-not-allowed' };
  }
  if (env.ACCESS_MODE === 'demo') {
    if (
      env.DEMO_TOKEN &&
      !tokensMatch(bearer(request.headers), env.DEMO_TOKEN)
    ) {
      return { allowed: false, status: 401, reason: 'demo-token-required' };
    }
    return { allowed: true, status: 200, reason: 'demo-access' };
  }
  if (request.requiresWrite)
    return { allowed: false, status: 403, reason: 'writes-disabled' };
  return { allowed: true, status: 200, reason: 'local-read-only' };
}
