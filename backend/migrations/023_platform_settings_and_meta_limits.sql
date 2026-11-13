CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value_encrypted TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS messaging_limit_tier TEXT DEFAULT 'TIER_1K';
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS verified_name TEXT;
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS code_verification_status TEXT;

