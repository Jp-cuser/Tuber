export const themes = [
  'default',
  'cool',
  'mono',
  'ocean',
  'forest',
  'sunset',
] as const;
export const languages = [
  'ja',
  'en',
  'ko',
  'zh-CN',
  'zh-TW',
  'vi',
  'fr',
  'es',
  'pt',
  'de',
  'ru',
  'it',
  'ar',
  'hi',
  'pl',
  'th',
] as const;
export const presets = [
  {
    id: 'friendly',
    name: 'Friendly guide',
    prompt: 'Be a warm and concise guide.',
    questions: ['今日のおすすめは？', 'できることを教えて'],
  },
  {
    id: 'teacher',
    name: 'Patient teacher',
    prompt: 'Teach step by step with examples.',
    questions: ['この概念を簡単に説明して', '練習問題を作って'],
  },
  {
    id: 'creative',
    name: 'Creative partner',
    prompt: 'Brainstorm original, practical ideas.',
    questions: ['アイデアを5つ出して', '別の視点で考えて'],
  },
  {
    id: 'concise',
    name: 'Concise assistant',
    prompt: 'Answer directly and briefly.',
    questions: ['要点だけまとめて', '次の一手は？'],
  },
  {
    id: 'streamer',
    name: 'Stream companion',
    prompt: 'Respond with lively broadcast-friendly energy.',
    questions: ['配信の話題を提案して', '視聴者へ挨拶して'],
  },
] as const;

export type Theme = (typeof themes)[number];
export type Language = (typeof languages)[number];
export type BackgroundMode =
  | 'gradient'
  | 'image'
  | 'video'
  | 'webcam'
  | 'capture'
  | 'green';
export type AssistantStyle = 'bubble' | 'borderless';
export type ChatDesign = 'glass' | 'classic';
export type ReasoningEffort =
  | 'none'
  | 'minimal'
  | 'low'
  | 'medium'
  | 'high'
  | 'xhigh';

export interface SettingsState {
  version: 4;
  aiProvider: import('@/features/ai/types').AiProvider;
  aiModel: string;
  historyLimit: number;
  reasoningEnabled: boolean;
  reasoningEffort: ReasoningEffort;
  reasoningTokenBudget: number;
  reasoningVisible: boolean;
  theme: Theme;
  language: Language;
  controlsVisible: boolean;
  assistantVisible: boolean;
  assistantStyle: AssistantStyle;
  characterNameVisible: boolean;
  characterName: string;
  userName: string;
  chatVisible: boolean;
  chatWidth: number;
  chatSide: 'left' | 'right';
  chatDesign: ChatDesign;
  edgeOffset: number;
  backgroundMode: BackgroundMode;
  videoVisible: boolean;
  overlayMode: 'hidden' | 'placed' | 'modal';
  selectedPreset: string;
  presentationMode: boolean;
  japaneseEnglishReading: boolean;
}

export const defaultSettings: SettingsState = {
  version: 4,
  aiProvider: 'openai',
  aiModel: 'gpt-4o-mini',
  historyLimit: 20,
  reasoningEnabled: false,
  reasoningEffort: 'medium',
  reasoningTokenBudget: 1024,
  reasoningVisible: false,
  theme: 'default',
  language: 'ja',
  controlsVisible: true,
  assistantVisible: true,
  assistantStyle: 'bubble',
  characterNameVisible: true,
  characterName: 'Local AI',
  userName: 'You',
  chatVisible: true,
  chatWidth: 360,
  chatSide: 'right',
  chatDesign: 'glass',
  edgeOffset: 24,
  backgroundMode: 'gradient',
  videoVisible: true,
  overlayMode: 'hidden',
  selectedPreset: 'friendly',
  presentationMode: false,
  japaneseEnglishReading: false,
};
