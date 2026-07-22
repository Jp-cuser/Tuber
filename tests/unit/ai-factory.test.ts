import { createAiAdapter } from '@/features/ai/factory';

beforeAll(() => {
  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    value: jest.fn(),
  });
});

test.each([
  'openai',
  'xai',
  'groq',
  'mistralai',
  'perplexity',
  'fireworks',
  'deepseek',
  'openrouter',
  'lmstudio',
  'anthropic',
  'google',
  'azure',
  'cohere',
  'ollama',
  'dify',
] as const)('creates the %s adapter', (provider) => {
  expect(createAiAdapter({ provider, timeoutMs: 60_000 })).toBeDefined();
});

test('requires specialized custom API configuration', () => {
  expect(() =>
    createAiAdapter({ provider: 'custom-api', timeoutMs: 60_000 }),
  ).toThrow('specialized configuration');
});
