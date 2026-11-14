import { AIProviderAdapter, IntentClassificationResult, intentResultSchema } from '../types';
import { HeuristicAdapter } from './heuristic';

export class GeminiAdapter implements AIProviderAdapter {
  readonly name = 'gemini' as const;
  private apiKey?: string;
  private fallback: HeuristicAdapter;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.fallback = new HeuristicAdapter();
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 10);
  }

  async classifyIntent(text: string): Promise<IntentClassificationResult> {
    if (!this.isConfigured()) {
      return this.fallback.classifyIntent(text);
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1400);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
      const prompt = `Classify this customer support message into JSON with keys: intent (billing_payment, technical_support, sales_inquiry, account_security, order_status, complaint, or general_support), confidence (0.0 to 1.0), reasoning (short), suggested_pod.
Customer message: "${text.slice(0, 500).replace(/["\\]/g, ' ')}"`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
            maxOutputTokens: 150
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!res.ok) {
        return this.fallback.classifyIntent(text);
      }

      const data = (await res.json()) as any;
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const rawJson = JSON.parse(rawText);
      return intentResultSchema.parse({
        intent: rawJson.intent,
        confidence: Math.min(1, Math.max(0, Number(rawJson.confidence) || 0.8)),
        reasoning: String(rawJson.reasoning || 'Gemini classified intent').slice(0, 200),
        suggested_pod: String(rawJson.suggested_pod || 'general').slice(0, 50),
        provider: 'gemini'
      });
    } catch {
      return this.fallback.classifyIntent(text);
    }
  }
}

