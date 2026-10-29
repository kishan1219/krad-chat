-- 019: Security Hardening: Row-Level Security (RLS) & Performance Indexes
-- Adds Row-Level Security for multi-tenant data protection and high-throughput query indexing.

-- 1. Performance Indexes for High-Frequency Queries
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_status ON campaigns(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_campaign_recipient ON messages(campaign_id, recipient);
CREATE INDEX IF NOT EXISTS idx_messages_tenant_status ON messages(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv_created ON chat_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_phone ON conversations(tenant_id, phone);
CREATE INDEX IF NOT EXISTS idx_ledger_user_created ON ledger(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_action ON audit_logs(tenant_id, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_tenant_kind ON resources(tenant_id, kind);
CREATE INDEX IF NOT EXISTS idx_sessions_user_expires ON sessions(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_challenge_kind ON auth_tokens(challenge, kind);
CREATE INDEX IF NOT EXISTS idx_white_label_domain ON white_label_configs(domain);
CREATE INDEX IF NOT EXISTS idx_reseller_markups_reseller ON reseller_markups(reseller_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);

-- 2. Row Level Security (RLS) Enablement
ALTER TABLE IF EXISTS campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS files ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS white_label_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reseller_markups ENABLE ROW LEVEL SECURITY;

-- 3. Row-Level Security Policies (Fallback to bypass if app.current_tenant_id is not set / embedded system)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_campaigns' AND tablename = 'campaigns'
  ) THEN
    CREATE POLICY tenant_isolation_campaigns ON campaigns
      FOR ALL
      USING (
        NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer
        OR current_setting('app.is_super_admin', true) = 'true'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_messages' AND tablename = 'messages'
  ) THEN
    CREATE POLICY tenant_isolation_messages ON messages
      FOR ALL
      USING (
        NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer
        OR current_setting('app.is_super_admin', true) = 'true'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_conversations' AND tablename = 'conversations'
  ) THEN
    CREATE POLICY tenant_isolation_conversations ON conversations
      FOR ALL
      USING (
        NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer
        OR current_setting('app.is_super_admin', true) = 'true'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_resources' AND tablename = 'resources'
  ) THEN
    CREATE POLICY tenant_isolation_resources ON resources
      FOR ALL
      USING (
        NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer
        OR current_setting('app.is_super_admin', true) = 'true'
      );
  END IF;
END $$;
