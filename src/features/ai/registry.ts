import type { AiProvider } from './types';

export interface ProviderDescriptor {
  id: AiProvider;
  name: string;
  kind: 'native' | 'openai-compatible' | 'local' | 'workflow' | 'custom';
  defaultBaseUrl?: string;
  requiresApiKey: boolean;
}
const descriptors: ProviderDescriptor[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    kind: 'native',
    defaultBaseUrl: 'https://api.openai.com/v1',
    requiresApiKey: true,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    kind: 'native',
    defaultBaseUrl: 'https://api.anthropic.com',
    requiresApiKey: true,
  },
  {
    id: 'google',
    name: 'Google Gemini',
    kind: 'native',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com',
    requiresApiKey: true,
  },
  { id: 'azure', name: 'Azure OpenAI', kind: 'native', requiresApiKey: true },
  {
    id: 'xai',
    name: 'xAI',
    kind: 'openai-compatible',
    defaultBaseUrl: 'https://api.x.ai/v1',
    requiresApiKey: true,
  },
  {
    id: 'groq',
    name: 'Groq',
    kind: 'openai-compatible',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    requiresApiKey: true,
  },
  {
    id: 'cohere',
    name: 'Cohere',
    kind: 'native',
    defaultBaseUrl: 'https://api.cohere.com/v2',
    requiresApiKey: true,
  },
  {
    id: 'mistralai',
    name: 'Mistral AI',
    kind: 'openai-compatible',
    defaultBaseUrl: 'https://api.mistral.ai/v1',
    requiresApiKey: true,
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    kind: 'openai-compatible',
    defaultBaseUrl: 'https://api.perplexity.ai',
    requiresApiKey: true,
  },
  {
    id: 'fireworks',
    name: 'Fireworks',
    kind: 'openai-compatible',
    defaultBaseUrl: 'https://api.fireworks.ai/inference/v1',
    requiresApiKey: true,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    kind: 'openai-compatible',
    defaultBaseUrl: 'https://api.deepseek.com',
    requiresApiKey: true,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    kind: 'openai-compatible',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    requiresApiKey: true,
  },
  {
    id: 'lmstudio',
    name: 'LM Studio',
    kind: 'local',
    defaultBaseUrl: 'http://127.0.0.1:1234/v1',
    requiresApiKey: false,
  },
  {
    id: 'ollama',
    name: 'Ollama',
    kind: 'local',
    defaultBaseUrl: 'http://127.0.0.1:11434',
    requiresApiKey: false,
  },
  { id: 'dify', name: 'Dify', kind: 'workflow', requiresApiKey: true },
  {
    id: 'custom-api',
    name: 'Custom API',
    kind: 'custom',
    requiresApiKey: false,
  },
];
export const providerRegistry = new Map(
  descriptors.map((provider) => [provider.id, provider]),
);
export function getProviderDescriptor(
  provider: AiProvider,
): ProviderDescriptor {
  const descriptor = providerRegistry.get(provider);
  if (!descriptor) throw new Error(`Unknown AI provider: ${provider}`);
  return descriptor;
}
