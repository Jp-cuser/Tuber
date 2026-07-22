import { defaultSettings } from '@/features/settings/types';
import { migrateSettings } from '@/features/settings/migration';

describe('migrateSettings', () => {
  it('returns defaults for invalid data', () => {
    expect(migrateSettings(null)).toEqual(defaultSettings);
  });

  it('preserves known persisted values and fills new fields', () => {
    expect(
      migrateSettings({
        version: 0,
        state: { theme: 'forest', chatWidth: 480 },
      }),
    ).toMatchObject({
      version: 5,
      theme: 'forest',
      chatWidth: 480,
      language: 'ja',
      aiProvider: 'openai',
      aiModel: 'gpt-4o-mini',
      historyLimit: 20,
      reasoningEnabled: false,
      reasoningEffort: 'medium',
      reasoningTokenBudget: 1024,
      reasoningVisible: false,
      searchGroundingEnabled: false,
      searchGroundingDynamicThreshold: true,
    });
  });

  it('validates imported reasoning configuration', () => {
    expect(
      migrateSettings({
        state: { reasoningEffort: 'invalid', reasoningTokenBudget: 1 },
      }),
    ).toMatchObject({ reasoningEffort: 'medium', reasoningTokenBudget: 1024 });
  });

  it('rejects an out-of-range imported history limit', () => {
    expect(
      migrateSettings({ state: { historyLimit: 1000 } }).historyLimit,
    ).toBe(20);
  });
});
