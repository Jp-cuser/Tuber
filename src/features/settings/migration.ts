import { defaultSettings, type SettingsState } from './types';

export const SETTINGS_VERSION = 1;

export function migrateSettings(persisted: unknown): SettingsState {
  if (!persisted || typeof persisted !== 'object') return defaultSettings;
  const wrapper = persisted as {
    version?: number;
    state?: Partial<SettingsState>;
  };
  const candidate = wrapper.state ?? (persisted as Partial<SettingsState>);
  return { ...defaultSettings, ...candidate, version: SETTINGS_VERSION };
}
