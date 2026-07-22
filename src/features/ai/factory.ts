import type { AiProviderAdapter, AiProviderConfig } from './types';
import {
  OpenAiCompatibleAdapter,
  isOpenAiCompatibleProvider,
} from './adapters/openai-compatible';
import { AnthropicAdapter } from './adapters/anthropic';
import { AzureOpenAiAdapter } from './adapters/azure-openai';
import { CohereAdapter } from './adapters/cohere';
import { DifyAdapter } from './adapters/dify';
import { GeminiAdapter } from './adapters/gemini';
import { OllamaAdapter } from './adapters/ollama';

export function createAiAdapter(config: AiProviderConfig): AiProviderAdapter {
  if (isOpenAiCompatibleProvider(config.provider))
    return new OpenAiCompatibleAdapter({
      ...config,
      provider: config.provider,
    });
  if (config.provider === 'anthropic')
    return new AnthropicAdapter({ ...config, provider: 'anthropic' });
  if (config.provider === 'google')
    return new GeminiAdapter({ ...config, provider: 'google' });
  if (config.provider === 'azure')
    return new AzureOpenAiAdapter({ ...config, provider: 'azure' });
  if (config.provider === 'cohere')
    return new CohereAdapter({ ...config, provider: 'cohere' });
  if (config.provider === 'ollama')
    return new OllamaAdapter({ ...config, provider: 'ollama' });
  if (config.provider === 'dify')
    return new DifyAdapter({ ...config, provider: 'dify' });
  throw new Error(
    `Provider adapter requires specialized configuration: ${config.provider}`,
  );
}
