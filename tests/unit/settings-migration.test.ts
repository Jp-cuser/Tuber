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
      version: 1,
      theme: 'forest',
      chatWidth: 480,
      language: 'ja',
    });
  });
});
