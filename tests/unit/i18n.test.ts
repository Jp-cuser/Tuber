import { languages } from '@/features/settings/types';
import {
  baseTranslation,
  nativeTranslationCoverage,
  resources,
} from '@/features/i18n/resources';

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

  it('uses complete native Japanese and English resources', () => {
    expect(nativeTranslationCoverage.ja).toBe(1);
    expect(nativeTranslationCoverage.en).toBe(1);
  });

  it.each(languages.filter((language) => language !== 'ja'))(
    '%s never falls back to Japanese labels',
    (language) => {
      expect(resources[language].translation.controls).not.toBe(
        baseTranslation.controls,
      );
    },
  );
});
