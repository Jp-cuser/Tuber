import {
  defaultSettings,
  type ReasoningEffort,
  type SettingsState,
} from './types';

export const SETTINGS_VERSION = 5;

const reasoningEfforts: ReasoningEffort[] = [
  'none',
  'minimal',
  'low',
  'medium',
  'high',
  'xhigh',
];

export function migrateSettings(persisted: unknown): SettingsState {
  if (!persisted || typeof persisted !== 'object') return defaultSettings;
  const wrapper = persisted as {
    version?: number;
    state?: Partial<SettingsState>;
  };
  const candidate = wrapper.state ?? (persisted as Partial<SettingsState>);
  const historyLimit = Number(candidate.historyLimit);
  const reasoningTokenBudget = Number(candidate.reasoningTokenBudget);
  return {
    ...defaultSettings,
    ...candidate,
    historyLimit:
      Number.isInteger(historyLimit) && historyLimit >= 2 && historyLimit <= 200
        ? historyLimit
        : defaultSettings.historyLimit,
    reasoningEffort: reasoningEfforts.includes(
      candidate.reasoningEffort as ReasoningEffort,
    )
      ? (candidate.reasoningEffort as ReasoningEffort)
      : defaultSettings.reasoningEffort,
    reasoningTokenBudget:
      Number.isInteger(reasoningTokenBudget) &&
      reasoningTokenBudget >= 128 &&
      reasoningTokenBudget <= 32_768
        ? reasoningTokenBudget
        : defaultSettings.reasoningTokenBudget,
    version: SETTINGS_VERSION,
  };
}
