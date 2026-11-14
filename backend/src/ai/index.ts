import { AIProviderAdapter, IntentClassificationResult } from './types';
import { HeuristicAdapter } from './providers/heuristic';
import { OpenAIAdapter } from './providers/openai';
import { GeminiAdapter } from './providers/gemini';
import { ClaudeAdapter } from './providers/claude';

export class AIClassifier {
  private providers: AIProviderAdapter[];
  private heuristic: HeuristicAdapter;
  private cache: Map<string, { result: IntentClassificationResult; expiresAt: number }> = new Map();

  constructor() {
    this.heuristic = new HeuristicAdapter();
    this.providers = [
      new OpenAIAdapter(),
      new GeminiAdapter(),
      new ClaudeAdapter(),
      this.heuristic
    ];
  }

  async classify(text: string): Promise<IntentClassificationResult> {
    const cleanKey = text.trim().toLowerCase().slice(0, 200);
    const cached = this.cache.get(cleanKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.result;
    }

    const activeProvider = this.providers.find(p => p.isConfigured()) || this.heuristic;
    let result: IntentClassificationResult;

    try {
      result = await activeProvider.classifyIntent(text);
    } catch {
      result = await this.heuristic.classifyIntent(text);
    }

    if (this.cache.size > 1000) {
      this.cache.clear();
    }
    this.cache.set(cleanKey, {
      result,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes cache
    });

    return result;
  }
}

export * from './types';

