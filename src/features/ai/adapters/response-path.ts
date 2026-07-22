import { AppError } from '@/lib/errors/app-error';

export function readResponsePath(value: unknown, path: string): string {
  const parts = path.split('.').filter(Boolean);
  if (
    !parts.length ||
    parts.some((part) =>
      ['__proto__', 'prototype', 'constructor'].includes(part),
    )
  )
    throw new AppError('BAD_REQUEST', 400, 'Invalid response path');
  let current: unknown = value;
  for (const part of parts) {
    if (!current || typeof current !== 'object')
      throw new AppError('INTERNAL_ERROR', 502, 'Response path was not found');
    current = (current as Record<string, unknown>)[part];
  }
  if (typeof current !== 'string')
    throw new AppError(
      'INTERNAL_ERROR',
      502,
      'Response path did not contain text',
    );
  return current;
}
