import { getAiProviderConfig } from '@/features/ai/server-config';
import { AppError } from '@/lib/errors/app-error';

describe('AI server configuration', () => {
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
});
