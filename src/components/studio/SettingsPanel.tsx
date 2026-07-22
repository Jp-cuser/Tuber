import { useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { exportSettings, useSettingsStore } from '@/features/settings/store';
import { languageNames } from '@/features/i18n/resources';
import { providerRegistry } from '@/features/ai/registry';
import {
  languages,
  presets,
  themes,
  type SettingsState,
} from '@/features/settings/types';

const Select = ({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) => (
  <label className="grid gap-1 text-sm">
    <span className="text-white/65">{label}</span>
    <select
      className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {children}
    </select>
  </label>
);
const Toggle = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) => (
  <label className="flex items-center justify-between gap-4 py-1 text-sm">
    <span>{label}</span>
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
    />
  </label>
);

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const store = useSettingsStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState('');
  const update = <Key extends keyof SettingsState>(
    key: Key,
    value: SettingsState[Key],
  ) => store.update(key, value);
  const save = () => {
    const data = exportSettings(store);
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(
      new Blob([data], { type: 'application/json' }),
    );
    anchor.download = 'local-ai-tuber-settings.json';
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };
  const load = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    void file
      .text()
      .then((text) => {
        store.importSettings(JSON.parse(text) as unknown);
        setImportError('');
      })
      .catch(() => setImportError('Invalid settings file'));
  };

  return (
    <aside
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-white/10 bg-slate-950/95 p-6 shadow-2xl"
      aria-label={t('settings')}
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('settings')}</h2>
        <button
          className="rounded-lg px-3 py-2 hover:bg-white/10"
          onClick={onClose}
        >
          {t('close')}
        </button>
      </div>
      <div className="grid gap-5">
        <Select
          label="AI provider"
          value={store.aiProvider}
          onChange={(value) =>
            update('aiProvider', value as SettingsState['aiProvider'])
          }
        >
          {[...providerRegistry.values()].map((provider) => (
            <option value={provider.id} key={provider.id}>
              {provider.name}
            </option>
          ))}
        </Select>
        <label className="grid gap-1 text-sm">
          <span className="text-white/65">AI model</span>
          <input
            className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2"
            value={store.aiModel}
            onChange={(event) => update('aiModel', event.target.value)}
            maxLength={200}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-white/65">Maximum history messages</span>
          <input
            type="number"
            className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2"
            value={store.historyLimit}
            min={2}
            max={200}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isInteger(value) && value >= 2 && value <= 200)
                update('historyLimit', value);
            }}
          />
        </label>
        <Select
          label={t('language')}
          value={store.language}
          onChange={(value) =>
            update('language', value as SettingsState['language'])
          }
        >
          {languages.map((language) => (
            <option value={language} key={language}>
              {languageNames[language]}
            </option>
          ))}
        </Select>
        <Select
          label={t('theme')}
          value={store.theme}
          onChange={(value) => update('theme', value as SettingsState['theme'])}
        >
          {themes.map((theme) => (
            <option value={theme} key={theme}>
              {theme}
            </option>
          ))}
        </Select>
        <Select
          label={t('characterPreset')}
          value={store.selectedPreset}
          onChange={(value) => update('selectedPreset', value)}
        >
          {presets.map((preset) => (
            <option value={preset.id} key={preset.id}>
              {preset.name}
            </option>
          ))}
        </Select>
        <fieldset className="rounded-xl border border-white/10 p-4">
          <legend className="px-2 font-semibold">{t('appearance')}</legend>
          <Toggle
            label={t('controls')}
            checked={store.controlsVisible}
            onChange={(value) => update('controlsVisible', value)}
          />
          <Toggle
            label={t('assistant')}
            checked={store.assistantVisible}
            onChange={(value) => update('assistantVisible', value)}
          />
          <Toggle
            label={t('chat')}
            checked={store.chatVisible}
            onChange={(value) => update('chatVisible', value)}
          />
          <Toggle
            label={t('characterName')}
            checked={store.characterNameVisible}
            onChange={(value) => update('characterNameVisible', value)}
          />
          <Toggle
            label={t('englishReading')}
            checked={store.japaneseEnglishReading}
            onChange={(value) => update('japaneseEnglishReading', value)}
          />
        </fieldset>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm">
            {t('characterName')}
            <input
              className="rounded-lg bg-slate-900 px-3 py-2"
              value={store.characterName}
              onChange={(event) => update('characterName', event.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm">
            {t('userName')}
            <input
              className="rounded-lg bg-slate-900 px-3 py-2"
              value={store.userName}
              onChange={(event) => update('userName', event.target.value)}
            />
          </label>
        </div>
        <Select
          label={t('style')}
          value={store.assistantStyle}
          onChange={(value) =>
            update('assistantStyle', value as SettingsState['assistantStyle'])
          }
        >
          <option value="bubble">{t('bubble')}</option>
          <option value="borderless">{t('borderless')}</option>
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Select
            label={t('chatPosition')}
            value={store.chatSide}
            onChange={(value) =>
              update('chatSide', value as SettingsState['chatSide'])
            }
          >
            <option value="left">{t('left')}</option>
            <option value="right">{t('right')}</option>
          </Select>
          <Select
            label={t('design')}
            value={store.chatDesign}
            onChange={(value) =>
              update('chatDesign', value as SettingsState['chatDesign'])
            }
          >
            <option value="glass">{t('glass')}</option>
            <option value="classic">{t('classic')}</option>
          </Select>
        </div>
        <label className="grid gap-1 text-sm">
          {t('width')}{' '}
          <input
            type="range"
            min="280"
            max="600"
            value={store.chatWidth}
            onChange={(event) =>
              update('chatWidth', Number(event.target.value))
            }
          />
        </label>
        <label className="grid gap-1 text-sm">
          {t('offset')}{' '}
          <input
            type="range"
            min="0"
            max="96"
            value={store.edgeOffset}
            onChange={(event) =>
              update('edgeOffset', Number(event.target.value))
            }
          />
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            className="rounded-lg bg-cyan-500 px-3 py-2 font-semibold text-slate-950"
            onClick={save}
          >
            {t('export')}
          </button>
          <button
            className="rounded-lg bg-white/10 px-3 py-2"
            onClick={() => inputRef.current?.click()}
          >
            {t('import')}
          </button>
          <button
            className="rounded-lg bg-rose-500/20 px-3 py-2 text-rose-200"
            onClick={store.reset}
          >
            {t('reset')}
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={load}
        />
        {importError && (
          <p role="alert" className="text-sm text-rose-300">
            {importError}
          </p>
        )}
      </div>
    </aside>
  );
}
