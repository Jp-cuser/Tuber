import type { AiStreamChunk } from './client';
import type { AiProvider } from './types';

export interface AiStreamDelta {
  text?: string;
  reasoning?: string;
  done?: boolean;
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : undefined;
}

function string(value: unknown): string | undefined {
  return typeof value === 'string' && value ? value : undefined;
}

function jsonData(chunk: AiStreamChunk): unknown {
  if (chunk.format === 'ndjson') return chunk.data;
  if (chunk.format === 'sse') {
    if (chunk.data === '[DONE]') return { done: true };
    try {
      return JSON.parse(chunk.data) as unknown;
    } catch {
      return { text: chunk.data };
    }
  }
  try {
    return JSON.parse(chunk.data) as unknown;
  } catch {
    return { text: chunk.data };
  }
}

export function extractAiStreamDelta(
  provider: AiProvider,
  chunk: AiStreamChunk,
): AiStreamDelta {
  const data = record(jsonData(chunk));
  if (!data) return {};
  if (data.done === true) return { done: true };

  if (
    [
      'openai',
      'azure',
      'xai',
      'groq',
      'mistralai',
      'perplexity',
      'fireworks',
      'deepseek',
      'openrouter',
      'lmstudio',
    ].includes(provider)
  ) {
    const choice = record((data.choices as unknown[] | undefined)?.[0]);
    const delta = record(choice?.delta);
    return {
      text: string(delta?.content),
      reasoning: string(delta?.reasoning_content),
      done: choice?.finish_reason != null,
    };
  }

  if (provider === 'anthropic') {
    const delta = record(data.delta);
    return {
      text: string(delta?.text),
      reasoning: string(delta?.thinking),
      done: data.type === 'message_stop',
    };
  }

  if (provider === 'google') {
    const candidate = record((data.candidates as unknown[] | undefined)?.[0]);
    const content = record(candidate?.content);
    const parts = (content?.parts as unknown[] | undefined) ?? [];
    return parts.reduce<AiStreamDelta>((result, partValue) => {
      const part = record(partValue);
      const value = string(part?.text);
      if (part?.thought === true)
        result.reasoning = `${result.reasoning ?? ''}${value ?? ''}`;
      else result.text = `${result.text ?? ''}${value ?? ''}`;
      return result;
    }, {});
  }

  if (provider === 'cohere') {
    const delta = record(data.delta);
    const message = record(delta?.message);
    const content = record(message?.content);
    return { text: string(content?.text), done: data.type === 'message-end' };
  }

  if (provider === 'ollama') {
    const message = record(data.message);
    return {
      text: string(message?.content) ?? string(data.response),
      reasoning: string(message?.thinking),
      done: data.done === true,
    };
  }

  if (provider === 'dify') {
    return {
      text: string(data.answer),
      done: data.event === 'message_end' || data.event === 'workflow_finished',
    };
  }

  return { text: string(data.text), done: data.done === true };
}
