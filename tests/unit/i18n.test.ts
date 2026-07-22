import { languages } from '@/features/settings/types';
import { baseTranslation, resources } from '@/features/i18n/resources';

describe('translations', () => {
  it('provides all 16 required languages', () => {
    expect(Object.keys(resources)).toEqual([...languages]);
  });

  it.each(languages)('%s has every translation key', (language) => {
    expect(Object.keys(resources[language].translation).sort()).toEqual(
      Object.keys(baseTranslation).sort(),
    );
    expect(Object.values(resources[language].translation).every(Boolean)).toBe(
      true,
    );
  });
});
