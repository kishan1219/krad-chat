import { AIProviderAdapter, IntentClassificationResult, intentResultSchema } from '../types';
import { HeuristicAdapter } from './heuristic';

export class OpenAIAdapter implements AIProviderAdapter {
  readonly name = 'openai' as const;
  private apiKey?: string;
  private fallback: HeuristicAdapter;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.fallback = new HeuristicAdapter();
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.startsWith('sk-'));
  }

  async classifyIntent(text: string): Promise<IntentClassificationResult> {
    if (!this.isConfigured()) {
      return this.fallback.classifyIntent(text);
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1400);

      const prompt = `Analyze this customer support message and classify its intent into exactly one of: billing_payment, technical_support, sales_inquiry, account_security, order_status, complaint, general_support.
Return pure JSON with keys: intent, confidence (0.0 to 1.0), reasoning (brief), suggested_pod.
Customer message: "${text.slice(0, 500).replace(/["\\]/g, ' ')}"`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an enterprise customer intent classifier. Output valid JSON only.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          max_tokens: 150,
          temperature: 0.1
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!res.ok) {
        return this.fallback.classifyIntent(text);
      }

      const data = (await res.json()) as any;
      const rawJson = JSON.parse(data.choices?.[0]?.message?.content || '{}');
      return intentResultSchema.parse({
        intent: rawJson.intent,
        confidence: Math.min(1, Math.max(0, Number(rawJson.confidence) || 0.8)),
        reasoning: String(rawJson.reasoning || 'AI classified intent').slice(0, 200),
        suggested_pod: String(rawJson.suggested_pod || 'general').slice(0, 50),
        provider: 'openai'
      });
    } catch {
      return this.fallback.classifyIntent(text);
    }
  }
}

