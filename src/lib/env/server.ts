import { z } from 'zod';

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);

export const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  ACCESS_MODE: z
    .enum(['disabled', 'protected', 'demo', 'unprotected'])
    .default('disabled'),
  ACCESS_TOKEN: z.preprocess(emptyToUndefined, z.string().min(16).optional()),
  DEMO_TOKEN: z.preprocess(emptyToUndefined, z.string().min(16).optional()),
  ALLOWED_ORIGINS: z.string().default('http://127.0.0.1:3000'),
  TRUST_PROXY: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .max(3_600_000)
    .default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce
    .number()
    .int()
    .positive()
    .max(10_000)
    .default(60),
  MAX_REQUEST_BODY_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .max(10_485_760)
    .default(1_048_576),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(environment: NodeJS.ProcessEnv): ServerEnv {
  const parsed = serverEnvSchema.safeParse(environment);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid server environment: ${details}`);
  }
  if (parsed.data.ACCESS_MODE === 'protected' && !parsed.data.ACCESS_TOKEN) {
    throw new Error(
      'Invalid server environment: ACCESS_TOKEN is required in protected mode',
    );
  }
  return parsed.data;
}

let cached: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  cached ??= parseServerEnv(process.env);
  return cached;
}

export function resetServerEnvForTests(): void {
  cached = undefined;
}
