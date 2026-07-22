import { CustomApiAdapter } from './adapters/custom-api';
import { createAiAdapter } from './factory';
import { getAiProviderConfig, getCustomApiOptions } from './server-config';
import type { AiProvider, AiProviderAdapter } from './types';

export function createServerAiAdapter(
  provider: AiProvider,
  environment: Readonly<Record<string, string | undefined>> = process.env,
): AiProviderAdapter {
  return provider === 'custom-api'
    ? new CustomApiAdapter(getCustomApiOptions(environment))
    : createAiAdapter(getAiProviderConfig(provider, environment));
}
