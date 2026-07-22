import { defaultSettings, type SettingsState } from './types';

export const SETTINGS_VERSION = 3;

export function migrateSettings(persisted: unknown): SettingsState {
  if (!persisted || typeof persisted !== 'object') return defaultSettings;
  const wrapper = persisted as {
    version?: number;
    state?: Partial<SettingsState>;
  };
  const candidate = wrapper.state ?? (persisted as Partial<SettingsState>);
  const historyLimit = Number(candidate.historyLimit);
  return {
    ...defaultSettings,
    ...candidate,
    historyLimit:
      Number.isInteger(historyLimit) && historyLimit >= 2 && historyLimit <= 200
        ? historyLimit
        : defaultSettings.historyLimit,
    version: SETTINGS_VERSION,
  };
}
