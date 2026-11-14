import { AIProviderAdapter, IntentClassificationResult, intentResultSchema } from '../types';
import { HeuristicAdapter } from './heuristic';

export class ClaudeAdapter implements AIProviderAdapter {
  readonly name = 'claude' as const;
  private apiKey?: string;
  private fallback: HeuristicAdapter;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    this.fallback = new HeuristicAdapter();
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.startsWith('sk-ant-'));
  }

  async classifyIntent(text: string): Promise<IntentClassificationResult> {
    if (!this.isConfigured()) {
      return this.fallback.classifyIntent(text);
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1400);

      const prompt = `Classify this message into pure JSON: {"intent": "billing_payment"|"technical_support"|"sales_inquiry"|"account_security"|"order_status"|"complaint"|"general_support", "confidence": float, "reasoning": "brief", "suggested_pod": "general"}.
Message: "${text.slice(0, 500).replace(/["\\]/g, ' ')}"`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey || '',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 150,
          temperature: 0.1,
          messages: [{ role: 'user', content: prompt }]
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!res.ok) {
        return this.fallback.classifyIntent(text);
      }

      const data = (await res.json()) as any;
      const content = data.content?.[0]?.text || '{}';
      const cleanJson = content.replace(/```json|```/g, '').trim();
      const rawJson = JSON.parse(cleanJson);
      return intentResultSchema.parse({
        intent: rawJson.intent,
        confidence: Math.min(1, Math.max(0, Number(rawJson.confidence) || 0.8)),
        reasoning: String(rawJson.reasoning || 'Claude classified intent').slice(0, 200),
        suggested_pod: String(rawJson.suggested_pod || 'general').slice(0, 50),
        provider: 'claude'
      });
    } catch {
      return this.fallback.classifyIntent(text);
    }
  }
}
