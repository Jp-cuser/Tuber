import { getServerEnv } from '@/lib/env/server';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogFields = Readonly<Record<string, unknown>>;

const levelOrder: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};
const sensitiveKey = /authorization|api[-_]?key|token|secret|password|cookie/i;

function redact(value: unknown, key = ''): unknown {
  if (sensitiveKey.test(key)) return '[REDACTED]';
  if (Array.isArray(value)) return value.map((item) => redact(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, child]) => [
        childKey,
        redact(child, childKey),
      ]),
    );
  }
  return value;
}

function write(level: LogLevel, message: string, fields: LogFields = {}): void {
  if (levelOrder[level] < levelOrder[getServerEnv().LOG_LEVEL]) return;
  const safeFields = redact(fields) as LogFields;
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...safeFields,
  });
  const stream =
    level === 'error'
      ? console.error
      : level === 'warn'
        ? console.warn
        : console.log;
  stream(entry);
}

export const logger = {
  debug: (message: string, fields?: LogFields) =>
    write('debug', message, fields),
  info: (message: string, fields?: LogFields) => write('info', message, fields),
  warn: (message: string, fields?: LogFields) => write('warn', message, fields),
  error: (message: string, fields?: LogFields) =>
    write('error', message, fields),
};
