-- 017_organization_lifecycle.sql
-- Organization lifecycle state machine: pending -> active -> suspended -> closed

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'closed'));
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS status_reason TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS tenants_status ON tenants(status);
