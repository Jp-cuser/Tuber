import { aiProviders } from '@/features/ai/types';
import { aiRequestSchema, providerConfigSchema } from '@/features/ai/schemas';
import { providerRegistry } from '@/features/ai/registry';
import {
  ShortTermHistory,
  trimConversationHistory,
} from '@/features/ai/history';

const message = (id: string) => ({
  id,
  role: 'user' as const,
  content: id,
  timestamp: '2026-07-22T00:00:00.000Z',
});
describe('AI foundation', () => {
  it('registers every specified provider exactly once', () => {
    expect([...providerRegistry.keys()]).toEqual([...aiProviders]);
  });
  it('validates requests and rejects unknown providers', () => {
    expect(
      aiRequestSchema.safeParse({
        provider: 'openai',
        model: 'model',
        messages: [message('1')],
      }).success,
    ).toBe(true);
    expect(
      aiRequestSchema.safeParse({
        provider: 'unknown',
        model: 'model',
        messages: [],
      }).success,
    ).toBe(false);
  });
  it('applies a safe provider timeout default', () => {
    expect(providerConfigSchema.parse({ provider: 'openai' }).timeoutMs).toBe(
      60_000,
    );
  });
  it('keeps only the configured recent history', () => {
    const history = new ShortTermHistory(2);
    history.add(message('1'));
    history.add(message('2'));
    history.add(message('3'));
    expect(history.list().map((item) => item.id)).toEqual(['2', '3']);
  });
  it('trims immutable message lists to the newest messages', () => {
    const messages = [message('1'), message('2'), message('3')];
    expect(trimConversationHistory(messages, 2).map((item) => item.id)).toEqual(
      ['2', '3'],
    );
    expect(messages).toHaveLength(3);
  });
});
