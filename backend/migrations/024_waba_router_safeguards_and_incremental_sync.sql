-- 024: Multi-WABA Inbound Router, Automated Safeguards & Incremental Sync

-- Inbound Routing Rules for Multi-WABA distribution
CREATE TABLE IF NOT EXISTS waba_routing_rules (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK(rule_type IN ('geo', 'department', 'keyword', 'fallback')),
  match_pattern TEXT NOT NULL,
  target_phone_number_id TEXT NOT NULL,
  target_waba_id TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'general',
  priority INT NOT NULL DEFAULT 10,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waba_routing_rules_tenant ON waba_routing_rules(tenant_id, priority ASC);

-- Add safeguard & incremental sync tracking to meta_connections
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS safeguard_paused BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS safeguard_reason TEXT;
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS sync_schedule JSONB NOT NULL DEFAULT '{"poll_enabled": false, "poll_interval_hours": 6, "last_poll_at": null}'::jsonb;
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS sync_watermark TIMESTAMPTZ;
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS incremental_sync_count INT NOT NULL DEFAULT 0;
