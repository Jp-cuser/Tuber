import { z } from 'zod';
import { AppError } from '@/lib/errors/app-error';
import { getProviderDescriptor } from './registry';
import type { AiProvider, AiProviderConfig } from './types';
import type { CustomApiOptions } from './adapters/custom-api';

const providerEnvironmentNames: Record<AiProvider, string> = {
  openai: 'OPENAI',
  anthropic: 'ANTHROPIC',
  google: 'GOOGLE',
  azure: 'AZURE',
  xai: 'XAI',
  groq: 'GROQ',
  cohere: 'COHERE',
  mistralai: 'MISTRALAI',
  perplexity: 'PERPLEXITY',
  fireworks: 'FIREWORKS',
  deepseek: 'DEEPSEEK',
  openrouter: 'OPENROUTER',
  lmstudio: 'LMSTUDIO',
  ollama: 'OLLAMA',
  dify: 'DIFY',
  'custom-api': 'CUSTOM_API',
};

const timeoutSchema = z.coerce.number().int().min(1_000).max(300_000);

function optionalValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function getAiProviderConfig(
  provider: AiProvider,
  environment: Readonly<Record<string, string | undefined>> = process.env,
): AiProviderConfig {
  if (provider === 'custom-api')
    throw new AppError(
      'BAD_REQUEST',
      400,
      'Custom API requires custom options',
    );

  const prefix = `AI_${providerEnvironmentNames[provider]}`;
  const descriptor = getProviderDescriptor(provider);
  const apiKey = optionalValue(environment[`${prefix}_API_KEY`]);
  const baseUrl =
    optionalValue(environment[`${prefix}_BASE_URL`]) ??
    descriptor.defaultBaseUrl;
  const timeoutResult = timeoutSchema.safeParse(
    environment.AI_REQUEST_TIMEOUT_MS ?? '60000',
  );

  if (!timeoutResult.success) {
    throw new AppError(
      'INTERNAL_ERROR',
      500,
      'Invalid AI timeout configuration',
    );
  }
  if (descriptor.requiresApiKey && !apiKey) {
    throw new AppError('INTERNAL_ERROR', 500, 'AI provider is not configured');
  }

  return {
    provider,
    apiKey,
    baseUrl,
    deployment: optionalValue(environment[`${prefix}_DEPLOYMENT`]),
    apiVersion: optionalValue(environment[`${prefix}_API_VERSION`]),
    organization: optionalValue(environment[`${prefix}_ORGANIZATION`]),
    timeoutMs: timeoutResult.data,
  };
}

function parseJsonObject(
  value: string | undefined,
  name: string,
): Record<string, string> | undefined {
  if (!optionalValue(value)) return undefined;
  try {
    const parsed = JSON.parse(value as string) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      throw new Error();
    if (!Object.values(parsed).every((item) => typeof item === 'string'))
      throw new Error();
    return parsed as Record<string, string>;
  } catch {
    throw new AppError('INTERNAL_ERROR', 500, `Invalid ${name} configuration`);
  }
}

export function getCustomApiOptions(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): CustomApiOptions {
  const url = optionalValue(environment.AI_CUSTOM_API_URL);
  if (!url)
    throw new AppError('INTERNAL_ERROR', 500, 'Custom API is not configured');
  let bodyTemplate: unknown = { model: '{{model}}', messages: '{{messages}}' };
  if (optionalValue(environment.AI_CUSTOM_API_BODY_TEMPLATE)) {
    try {
      bodyTemplate = JSON.parse(
        environment.AI_CUSTOM_API_BODY_TEMPLATE as string,
      );
    } catch {
      throw new AppError(
        'INTERNAL_ERROR',
        500,
        'Invalid Custom API body template configuration',
      );
    }
  }
  return {
    url,
    allowedOrigins: new Set(
      (environment.AI_CUSTOM_API_ALLOWED_ORIGINS ?? '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
    headers: parseJsonObject(
      environment.AI_CUSTOM_API_HEADERS,
      'Custom API headers',
    ),
    bodyTemplate,
    responseTextPath:
      optionalValue(environment.AI_CUSTOM_API_RESPONSE_TEXT_PATH) ?? 'text',
  };
}
