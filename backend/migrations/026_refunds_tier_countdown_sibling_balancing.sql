-- 026: Refunds, Tier Countdown & Sibling Load Balancing

-- 1. Add refund tracking columns to payment_transactions
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS refunded_amount_paise BIGINT NOT NULL DEFAULT 0;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS refund_status TEXT NOT NULL DEFAULT 'none' 
  CHECK(refund_status IN ('none', 'partial', 'full'));

-- 2. Create payment_refunds table
CREATE TABLE IF NOT EXISTS payment_refunds (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id),
  payment_transaction_id BIGINT NOT NULL REFERENCES payment_transactions(id),
  refund_id TEXT NOT NULL,
  amount_paise BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  reason TEXT,
  status TEXT NOT NULL CHECK(status IN ('initiated', 'completed', 'failed')),
  initiated_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_refunds_tx ON payment_refunds(tenant_id, payment_transaction_id);

-- 3. Add Sibling Load Balancing columns to campaigns
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS is_sibling_balanced BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS sibling_pool_id BIGINT REFERENCES campaigns(id);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS allocated_phone_number_ids TEXT[] DEFAULT '{}'::text[];

-- 4. Tier Upgrade Countdown tracking in meta_connections
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS green_streak_days INT NOT NULL DEFAULT 0;
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS target_tier TEXT;
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS last_streak_calculated_at TIMESTAMPTZ;

