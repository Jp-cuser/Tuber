import { AppError } from '@/lib/errors/app-error';

export function validateCustomApiUrl(
  value: string,
  allowedOrigins: ReadonlySet<string>,
): URL {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol))
    throw new AppError('BAD_REQUEST', 400, 'Unsupported URL scheme');
  const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
  if (!loopback && !allowedOrigins.has(url.origin))
    throw new AppError('FORBIDDEN', 403, 'Custom API origin is not allowed');
  return url;
}

export function validateRedirect(
  from: URL,
  target: string,
  allowedOrigins: ReadonlySet<string>,
): URL {
  return validateCustomApiUrl(new URL(target, from).toString(), allowedOrigins);
}
