-- Migration 029: Meta Connections Performance Indexes & Coexistence Architecture Support
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS connection_mode TEXT DEFAULT 'dedicated';
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS is_on_biz_app BOOLEAN DEFAULT false;
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS business_id TEXT;
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'not_applicable';

CREATE INDEX IF NOT EXISTS idx_meta_connections_tenant ON meta_connections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_meta_connections_waba ON meta_connections(waba_id);
CREATE INDEX IF NOT EXISTS idx_meta_connections_created_by ON meta_connections(created_by);
CREATE INDEX IF NOT EXISTS idx_meta_connections_phone_tenant ON meta_connections(phone_number_id, tenant_id);
