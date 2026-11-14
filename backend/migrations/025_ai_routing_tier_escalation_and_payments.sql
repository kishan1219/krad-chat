-- 025: AI-Driven Routing, Agent Pods, Dynamic Tier Batching, Native Payments

-- 1. Agent Pods (Specialized agent teams)
CREATE TABLE IF NOT EXISTS agent_pods (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'general',
  skills TEXT[] NOT NULL DEFAULT '{}'::text[],
  lead_user_id BIGINT REFERENCES users(id),
  member_user_ids BIGINT[] NOT NULL DEFAULT '{}'::bigint[],
  max_active_chats INT NOT NULL DEFAULT 25,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_pods_tenant ON agent_pods(tenant_id, active);

-- 2. Enhance waba_routing_rules for Intent and Pods
ALTER TABLE waba_routing_rules DROP CONSTRAINT IF EXISTS waba_routing_rules_rule_type_check;
ALTER TABLE waba_routing_rules ADD CONSTRAINT waba_routing_rules_rule_type_check 
  CHECK(rule_type IN ('geo', 'department', 'keyword', 'intent', 'fallback'));

ALTER TABLE waba_routing_rules ADD COLUMN IF NOT EXISTS target_pod_id BIGINT REFERENCES agent_pods(id);
ALTER TABLE waba_routing_rules ADD COLUMN IF NOT EXISTS confidence_threshold NUMERIC(3,2) NOT NULL DEFAULT 0.70;

-- 3. Enhance conversations for Pods and Intent tracking
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS assigned_pod_id BIGINT REFERENCES agent_pods(id);
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS detected_intent TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS intent_confidence NUMERIC(3,2);

-- 4. Dynamic Campaign Tier Batching metadata
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS is_predictive_batched BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS parent_campaign_id BIGINT REFERENCES campaigns(id);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS batch_index INT NOT NULL DEFAULT 1;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS total_batches INT NOT NULL DEFAULT 1;

-- 5. Native WhatsApp Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id),
  conversation_id BIGINT REFERENCES conversations(id),
  provider TEXT NOT NULL DEFAULT 'meta_pay',
  payment_type TEXT NOT NULL DEFAULT 'upi',
  status TEXT NOT NULL CHECK(status IN ('success', 'pending', 'failed', 'canceled')),
  reference_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  amount_paise BIGINT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  customer_phone TEXT NOT NULL,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_tenant_ref 
  ON payment_transactions(tenant_id, reference_id, transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_conv 
  ON payment_transactions(tenant_id, conversation_id);

