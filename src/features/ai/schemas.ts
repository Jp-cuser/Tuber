import { z } from 'zod';
import { aiProviders } from './types';

export const messageSchema = z.object({
  id: z.string().min(1),
  role: z.enum(['system', 'user', 'assistant']),
  content: z.union([
    z.string(),
    z.array(
      z.discriminatedUnion('type', [
        z.object({ type: z.literal('text'), text: z.string() }),
        z.object({
          type: z.literal('image'),
          data: z.string().min(1),
          mimeType: z.string().optional(),
        }),
      ]),
    ),
  ]),
  timestamp: z.iso.datetime(),
  name: z.string().optional(),
  emotion: z.string().optional(),
  reasoning: z.string().optional(),
  status: z
    .enum(['queued', 'streaming', 'complete', 'error', 'cancelled'])
    .optional(),
});
export const aiRequestSchema = z.object({
  provider: z.enum(aiProviders),
  model: z.string().min(1).max(200),
  messages: z.array(messageSchema).max(200),
  systemPrompt: z.string().max(100_000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxOutputTokens: z.number().int().positive().max(1_000_000).optional(),
  reasoning: z
    .object({
      enabled: z.boolean(),
      effort: z
        .enum(['none', 'minimal', 'low', 'medium', 'high', 'xhigh'])
        .optional(),
      tokenBudget: z.number().int().positive().optional(),
    })
    .optional(),
  searchGrounding: z
    .object({ enabled: z.boolean(), dynamicThreshold: z.boolean().optional() })
    .optional(),
  providerOptions: z.record(z.string(), z.unknown()).optional(),
});
export const providerConfigSchema = z.object({
  provider: z.enum(aiProviders),
  apiKey: z.string().min(1).optional(),
  baseUrl: z.url().optional(),
  deployment: z.string().min(1).optional(),
  apiVersion: z.string().min(1).optional(),
  organization: z.string().optional(),
  timeoutMs: z.number().int().min(1_000).max(300_000).default(60_000),
});
