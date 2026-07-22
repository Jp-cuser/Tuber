import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { languages, type Language } from '@/features/settings/types';
import { resources } from './resources';

export function detectLanguage(): Language {
  if (typeof navigator === 'undefined') return 'ja';
  const exact = languages.find(
    (language) => language.toLowerCase() === navigator.language.toLowerCase(),
  );
  return (
    exact ??
    languages.find(
      (language) => language.split('-')[0] === navigator.language.split('-')[0],
    ) ??
    'en'
  );
}

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: 'ja',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    initImmediate: false,
  });
}

export default i18n;
