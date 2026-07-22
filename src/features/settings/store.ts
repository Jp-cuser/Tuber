import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  defaultSettings,
  languages,
  themes,
  type SettingsState,
} from './types';
import { migrateSettings, SETTINGS_VERSION } from './migration';

interface SettingsActions {
  update: <Key extends keyof SettingsState>(
    key: Key,
    value: SettingsState[Key],
  ) => void;
  reset: () => void;
  importSettings: (value: unknown) => void;
}

export type SettingsStore = SettingsState & SettingsActions;

function environmentDefaults(): Partial<SettingsState> {
  const language = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE;
  const theme = process.env.NEXT_PUBLIC_DEFAULT_THEME;
  return {
    ...(languages.includes(language as SettingsState['language'])
      ? { language: language as SettingsState['language'] }
      : {}),
    ...(themes.includes(theme as SettingsState['theme'])
      ? { theme: theme as SettingsState['theme'] }
      : {}),
  };
}

const initialSettings = { ...defaultSettings, ...environmentDefaults() };

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...initialSettings,
      update: (key, value) => set({ [key]: value } as Partial<SettingsStore>),
      reset: () => set(initialSettings),
      importSettings: (value) => set(migrateSettings(value)),
    }),
    {
      name: 'local-ai-tuber-settings',
      version: SETTINGS_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted) => migrateSettings(persisted),
      merge: (persisted, current) => {
        const merged = { ...current, ...migrateSettings(persisted) };
        if (process.env.NEXT_PUBLIC_SETTINGS_ENV_OVERRIDE === 'true')
          return { ...merged, ...environmentDefaults() };
        return merged;
      },
    },
  ),
);

export function exportSettings(settings: SettingsState): string {
  return JSON.stringify(
    { version: SETTINGS_VERSION, state: settings },
    null,
    2,
  );
}
