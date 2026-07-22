export const aiProviders = [
  'openai',
  'anthropic',
  'google',
  'azure',
  'xai',
  'groq',
  'cohere',
  'mistralai',
  'perplexity',
  'fireworks',
  'deepseek',
  'openrouter',
  'lmstudio',
  'ollama',
  'dify',
  'custom-api',
] as const;
export type AiProvider = (typeof aiProviders)[number];
export type MessageRole = 'system' | 'user' | 'assistant';
export type MessageContent =
  | string
  | Array<
      | { type: 'text'; text: string }
      | { type: 'image'; data: string; mimeType?: string }
    >;
export interface Message {
  id: string;
  role: MessageRole;
  content: MessageContent;
  timestamp: string;
  name?: string;
  emotion?: string;
  reasoning?: string;
  status?: 'queued' | 'streaming' | 'complete' | 'error' | 'cancelled';
}
export interface AiRequest {
  provider: AiProvider;
  model: string;
  messages: Message[];
  systemPrompt?: string;
  temperature?: number;
  maxOutputTokens?: number;
  reasoning?: {
    enabled: boolean;
    effort?: 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh';
    tokenBudget?: number;
  };
  searchGrounding?: { enabled: boolean; dynamicThreshold?: boolean };
  providerOptions?: Record<string, unknown>;
}
export interface AiResult {
  text: string;
  reasoning?: string;
  providerMetadata?: Record<string, unknown>;
}
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
export interface AiProviderConfig {
  provider: AiProvider;
  apiKey?: string;
  baseUrl?: string;
  deployment?: string;
  apiVersion?: string;
  organization?: string;
  timeoutMs: number;
}
export interface AiProviderAdapter {
  validateConfig(config: AiProviderConfig): Promise<ValidationResult>;
  stream(request: AiRequest, signal: AbortSignal): Promise<Response>;
  generate(request: AiRequest, signal: AbortSignal): Promise<AiResult>;
  supportsMultimodal(model: string): boolean;
  supportsReasoning(model: string): boolean;
  supportsSearchGrounding(model: string): boolean;
}
