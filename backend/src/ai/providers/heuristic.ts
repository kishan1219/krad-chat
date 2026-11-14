import { AIProviderAdapter, IntentClassificationResult, IntentType } from '../types';

interface IntentKeywordDef {
  intent: IntentType;
  keywords: string[];
  pod: string;
}

const INTENT_DICTIONARY: IntentKeywordDef[] = [
  {
    intent: 'billing_payment',
    keywords: [
      'bill', 'invoice', 'payment', 'paid', 'charge', 'refund', 'receipt',
      'credit', 'failed payment', 'transaction', 'upi', 'deducted', 'balance'
    ],
    pod: 'billing_disputes'
  },
  {
    intent: 'technical_support',
    keywords: [
      'bug', 'error', 'failed', 'broken', 'crash', 'down', 'api', 'webhook',
      'integration', 'not working', '500', '404', 'timeout', 'exception'
    ],
    pod: 'technical_support'
  },
  {
    intent: 'sales_inquiry',
    keywords: [
      'pricing', 'quote', 'enterprise', 'demo', 'buy', 'purchase', 'plan',
      'upgrade', 'sales', 'discount', 'cost', 'subscription', 'package'
    ],
    pod: 'vip_sales'
  },
  {
    intent: 'account_security',
    keywords: [
      'login', 'password', 'otp', '2fa', 'hacked', 'locked', 'reset',
      'auth', 'verification', 'unauthorized', 'access', 'security'
    ],
    pod: 'security_escalation'
  },
  {
    intent: 'order_status',
    keywords: [
      'order', 'track', 'delivery', 'status', 'shipped', 'where is',
      'dispatch', 'courier', 'consignment', 'awb', 'shipment'
    ],
    pod: 'logistics_support'
  },
  {
    intent: 'complaint',
    keywords: [
      'terrible', 'worst', 'angry', 'scam', 'cheated', 'complain', 'manager',
      'unacceptable', 'sue', 'consumer court', 'pathetic', 'escalate'
    ],
    pod: 'customer_retention'
  }
];

export class HeuristicAdapter implements AIProviderAdapter {
  readonly name = 'heuristic' as const;

  isConfigured(): boolean {
    return true;
  }

  async classifyIntent(text: string): Promise<IntentClassificationResult> {
    const cleanText = text.toLowerCase().trim();
    if (!cleanText) {
      return {
        intent: 'general_support',
        confidence: 0.5,
        reasoning: 'Empty input, default to general inquiry',
        suggested_pod: 'general',
        provider: 'heuristic'
      };
    }

    let topIntent: IntentType = 'general_support';
    let topScore = 0;
    let topPod = 'general';

    for (const def of INTENT_DICTIONARY) {
      let score = 0;
      for (const kw of def.keywords) {
        if (cleanText.includes(kw)) {
          score += kw.length > 5 ? 2 : 1;
        }
      }
      if (score > topScore) {
        topScore = score;
        topIntent = def.intent;
        topPod = def.pod;
      }
    }

    const confidence = topScore >= 3 ? 0.95 : topScore >= 2 ? 0.85 : topScore === 1 ? 0.72 : 0.50;

    return {
      intent: topIntent,
      confidence,
      reasoning: topScore > 0 ? `Matched keywords for ${topIntent}` : 'General support fallback',
      suggested_pod: topPod,
      provider: 'heuristic'
    };
  }
}

