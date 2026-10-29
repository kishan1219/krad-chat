CREATE TABLE IF NOT EXISTS feature_flags (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_feature_flags_global ON feature_flags(feature_key) WHERE tenant_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_feature_flags_tenant ON feature_flags(tenant_id, feature_key) WHERE tenant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feature_flags_lookup ON feature_flags(tenant_id, feature_key);

-- Seed default global flags
INSERT INTO feature_flags (tenant_id, feature_key, enabled, metadata) VALUES
  (NULL, 'COMMERCE', true, '{"description": "WhatsApp Commerce, Catalog, and Shopping Cart"}'::jsonb),
  (NULL, 'BROADCAST_APPROVAL', true, '{"description": "Requires admin approval before dispatching broadcast campaigns"}'::jsonb),
  (NULL, 'FLOWS', true, '{"description": "Interactive WhatsApp Flows and Forms"}'::jsonb),
  (NULL, 'AI_AGENT', true, '{"description": "AI Agent automated conversation fallback"}'::jsonb),
  (NULL, 'WEBHOOK_REPLAY', true, '{"description": "Dead-letter queue replay and inspection tools"}'::jsonb)
ON CONFLICT DO NOTHING;
