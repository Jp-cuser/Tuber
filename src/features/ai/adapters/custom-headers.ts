import { AppError } from '@/lib/errors/app-error';

const forbidden = new Set([
  'host',
  'content-length',
  'connection',
  'transfer-encoding',
]);
export function buildCustomHeaders(values: Record<string, string>): Headers {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  for (const [name, value] of Object.entries(values)) {
    if (forbidden.has(name.toLowerCase()) || /[\r\n]/.test(name + value))
      throw new AppError('BAD_REQUEST', 400, 'Unsafe custom header');
    headers.set(name, value);
  }
  return headers;
}
export function redactCustomHeaders(values: Headers): Record<string, string> {
  return Object.fromEntries(
    [...values.entries()].map(([name, value]) => [
      name,
      /authorization|api[-_]?key|token|secret|cookie/i.test(name)
        ? '[REDACTED]'
        : value,
    ]),
  );
}
