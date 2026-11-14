import { z } from 'zod';

export const intentTypeSchema = z.enum([
  'billing_payment',
  'technical_support',
  'sales_inquiry',
  'account_security',
  'order_status',
  'complaint',
  'general_support'
]);

export type IntentType = z.infer<typeof intentTypeSchema>;

export const intentResultSchema = z.object({
  intent: intentTypeSchema,
  confidence: z.number().min(0).max(1),
  reasoning: z.string().max(500),
  suggested_pod: z.string().max(50).default('general'),
  provider: z.enum(['openai', 'gemini', 'claude', 'heuristic'])
});

export type IntentClassificationResult = z.infer<typeof intentResultSchema>;

export interface AIProviderAdapter {
  name: 'openai' | 'gemini' | 'claude' | 'heuristic';
  isConfigured(): boolean;
  classifyIntent(text: string): Promise<IntentClassificationResult>;
}

