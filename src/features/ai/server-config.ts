import { z } from 'zod';
import { AppError } from '@/lib/errors/app-error';
import { getProviderDescriptor } from './registry';
import type { AiProvider, AiProviderConfig } from './types';

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
  if (provider === 'custom-api') {
    throw new AppError(
      'BAD_REQUEST',
      400,
      'Custom API uses a dedicated server-side configuration endpoint',
    );
  }

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
