import {
  getAiProviderConfig,
  getCustomApiOptions,
} from '@/features/ai/server-config';
import { AppError } from '@/lib/errors/app-error';

describe('AI server configuration', () => {
  it.each([
    ['xai', 'XAI', 'https://api.x.ai/v1'],
    ['groq', 'GROQ', 'https://api.groq.com/openai/v1'],
    ['cohere', 'COHERE', 'https://api.cohere.com/v2'],
    ['mistralai', 'MISTRALAI', 'https://api.mistral.ai/v1'],
    ['perplexity', 'PERPLEXITY', 'https://api.perplexity.ai'],
    ['fireworks', 'FIREWORKS', 'https://api.fireworks.ai/inference/v1'],
    ['deepseek', 'DEEPSEEK', 'https://api.deepseek.com'],
    ['openrouter', 'OPENROUTER', 'https://openrouter.ai/api/v1'],
  ] as const)(
    'loads %s from its documented environment name',
    (provider, environmentName, baseUrl) => {
      expect(
        getAiProviderConfig(provider, {
          [`AI_${environmentName}_API_KEY`]: 'server-secret',
        }),
      ).toMatchObject({ provider, apiKey: 'server-secret', baseUrl });
    },
  );

  it('loads hosted-provider secrets only from the server environment', () => {
    expect(
      getAiProviderConfig('openai', {
        AI_OPENAI_API_KEY: 'server-secret',
        AI_REQUEST_TIMEOUT_MS: '12000',
      }),
    ).toMatchObject({
      provider: 'openai',
      apiKey: 'server-secret',
      baseUrl: 'https://api.openai.com/v1',
      timeoutMs: 12000,
    });
  });

  it('rejects an unconfigured hosted provider without exposing a key name', () => {
    expect(() => getAiProviderConfig('anthropic', {})).toThrow(
      new AppError('INTERNAL_ERROR', 500, 'AI provider is not configured'),
    );
  });

  it('allows loopback providers without an API key', () => {
    expect(getAiProviderConfig('ollama', {})).toMatchObject({
      baseUrl: 'http://127.0.0.1:11434',
      apiKey: undefined,
    });
  });

  it('loads Azure deployment settings from the server environment', () => {
    expect(
      getAiProviderConfig('azure', {
        AI_AZURE_API_KEY: 'azure-secret',
        AI_AZURE_BASE_URL: 'https://example.openai.azure.com',
        AI_AZURE_DEPLOYMENT: 'avatar-chat',
        AI_AZURE_API_VERSION: '2025-04-01-preview',
      }),
    ).toMatchObject({
      deployment: 'avatar-chat',
      apiVersion: '2025-04-01-preview',
    });
  });

  it('loads Custom API mapping without exposing it to the browser', () => {
    expect(
      getCustomApiOptions({
        AI_CUSTOM_API_URL: 'https://custom.example/chat',
        AI_CUSTOM_API_ALLOWED_ORIGINS: 'https://custom.example',
        AI_CUSTOM_API_HEADERS: '{"Authorization":"Bearer server-secret"}',
        AI_CUSTOM_API_BODY_TEMPLATE:
          '{"model":"{{model}}","messages":"{{messages}}"}',
        AI_CUSTOM_API_RESPONSE_TEXT_PATH: 'data.answer',
      }),
    ).toMatchObject({
      url: 'https://custom.example/chat',
      headers: { Authorization: 'Bearer server-secret' },
      bodyTemplate: { model: '{{model}}', messages: '{{messages}}' },
      responseTextPath: 'data.answer',
    });
  });

  it('rejects malformed Custom API header configuration', () => {
    expect(() =>
      getCustomApiOptions({
        AI_CUSTOM_API_URL: 'http://127.0.0.1:8080/chat',
        AI_CUSTOM_API_HEADERS: '{bad json}',
      }),
    ).toThrow('Invalid Custom API headers configuration');
  });
});
