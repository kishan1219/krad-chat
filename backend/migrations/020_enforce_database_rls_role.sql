-- 020: Enforce Database RLS Roles, Fail-Closed Multi-Tenant Policies & Immutable Audit Logs

-- 1. Create dedicated application role without SUPERUSER or BYPASSRLS
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'krad_app') THEN
    CREATE ROLE krad_app WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'krad_recovery') THEN
    CREATE ROLE krad_recovery WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Embedded / single-user engines like PGlite may lack multi-role management; continue gracefully
  RAISE NOTICE 'Role creation handled: %', SQLERRM;
END $$;

-- 2. Immutable, safe fail-closed tenant validation function
CREATE OR REPLACE FUNCTION public.current_tenant_id_safe()
RETURNS integer AS $$
DECLARE
  raw_val text;
BEGIN
  raw_val := current_setting('app.current_tenant_id', true);
  -- If missing, empty, or non-numeric, fail closed by returning NULL
  IF raw_val IS NULL OR raw_val = '' OR raw_val !~ '^[0-9]+$' THEN
    RETURN NULL;
  END IF;
  RETURN raw_val::integer;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, public;

-- 3. Hardened, bounded recovery logging procedure
CREATE OR REPLACE FUNCTION public.log_recovery_event(
  p_ticket_id text,
  p_action text,
  p_target text
) RETURNS void AS $$
BEGIN
  IF p_ticket_id IS NULL OR length(trim(p_ticket_id)) < 3 THEN
    RAISE EXCEPTION 'A valid operational ticket ID is required for recovery access.';
  END IF;
  INSERT INTO public.audit_logs(tenant_id, user_id, action, target, created_at)
  VALUES (
    NULL,
    NULL,
    'recovery.' || p_action,
    p_ticket_id || ':' || p_target,
    now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public;

-- Grant execute to krad_recovery only
REVOKE ALL ON FUNCTION public.log_recovery_event(text, text, text) FROM PUBLIC;
DO $$
BEGIN
  GRANT EXECUTE ON FUNCTION public.log_recovery_event(text, text, text) TO krad_recovery;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 4. Audit Log Immutability Protection Trigger
CREATE OR REPLACE FUNCTION public.protect_audit_log_immutability()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Audit log records are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public;

DROP TRIGGER IF EXISTS trg_protect_audit_logs ON public.audit_logs;
CREATE TRIGGER trg_protect_audit_logs
  BEFORE UPDATE OR DELETE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.protect_audit_log_immutability();

-- 5. Drop old fail-open policies from migration 019
DROP POLICY IF EXISTS tenant_isolation_campaigns ON campaigns;
DROP POLICY IF EXISTS tenant_isolation_messages ON messages;
DROP POLICY IF EXISTS tenant_isolation_conversations ON conversations;
DROP POLICY IF EXISTS tenant_isolation_chat_messages ON chat_messages;
DROP POLICY IF EXISTS tenant_isolation_resources ON resources;
DROP POLICY IF EXISTS tenant_isolation_files ON files;
DROP POLICY IF EXISTS tenant_isolation_api_keys ON api_keys;
DROP POLICY IF EXISTS tenant_isolation_white_label_configs ON white_label_configs;
DROP POLICY IF EXISTS tenant_isolation_reseller_markups ON reseller_markups;

-- 6. Ensure RLS is enabled and forced on all tenant tables
ALTER TABLE IF EXISTS campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS campaigns FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversations FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_messages FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS resources FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS files ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS files FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS api_keys FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS white_label_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS white_label_configs FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reseller_markups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reseller_markups FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wallets FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ledger FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS credit_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS credit_transfers FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversation_notes FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversation_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversation_reads FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS meta_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS meta_connections FORCE ROW LEVEL SECURITY;

-- 7. Create strict fail-closed policies with both USING and WITH CHECK clauses
CREATE POLICY tenant_isolation_campaigns ON campaigns
  FOR ALL
  USING (tenant_id = public.current_tenant_id_safe())
  WITH CHECK (tenant_id = public.current_tenant_id_safe());

CREATE POLICY tenant_isolation_messages ON messages
  FOR ALL
  USING (tenant_id = public.current_tenant_id_safe())
  WITH CHECK (tenant_id = public.current_tenant_id_safe());

CREATE POLICY tenant_isolation_conversations ON conversations
  FOR ALL
  USING (tenant_id = public.current_tenant_id_safe())
  WITH CHECK (tenant_id = public.current_tenant_id_safe());

CREATE POLICY tenant_isolation_chat_messages ON chat_messages
  FOR ALL
  USING (tenant_id = public.current_tenant_id_safe())
  WITH CHECK (tenant_id = public.current_tenant_id_safe());

CREATE POLICY tenant_isolation_resources ON resources
  FOR ALL
  USING (tenant_id = public.current_tenant_id_safe())
  WITH CHECK (tenant_id = public.current_tenant_id_safe());

CREATE POLICY tenant_isolation_files ON files
  FOR ALL
  USING (tenant_id = public.current_tenant_id_safe())
  WITH CHECK (tenant_id = public.current_tenant_id_safe());

CREATE POLICY tenant_isolation_api_keys ON api_keys
  FOR ALL
  USING (tenant_id = public.current_tenant_id_safe())
  WITH CHECK (tenant_id = public.current_tenant_id_safe());

CREATE POLICY tenant_isolation_white_label_configs ON white_label_configs
  FOR ALL
  USING (tenant_id = public.current_tenant_id_safe())
  WITH CHECK (tenant_id = public.current_tenant_id_safe());

CREATE POLICY tenant_isolation_reseller_markups ON reseller_markups
  FOR ALL
  USING (tenant_id = public.current_tenant_id_safe())
  WITH CHECK (tenant_id = public.current_tenant_id_safe());

CREATE POLICY tenant_isolation_wallets ON wallets
  FOR ALL
  USING (tenant_id = public.current_tenant_id_safe())
  WITH CHECK (tenant_id = public.current_tenant_id_safe());

CREATE POLICY tenant_isolation_ledger ON ledger
  FOR ALL
  USING (tenant_id = public.current_tenant_id_safe())
  WITH CHECK (tenant_id = public.current_tenant_id_safe());

CREATE POLICY tenant_isolation_credit_transfers ON credit_transfers
  FOR ALL
  USING (tenant_id = public.current_tenant_id_safe())
  WITH CHECK (tenant_id = public.current_tenant_id_safe());

CREATE POLICY tenant_isolation_conversation_notes ON conversation_notes
  FOR ALL
  USING (tenant_id = public.current_tenant_id_safe())
  WITH CHECK (tenant_id = public.current_tenant_id_safe());

CREATE POLICY tenant_isolation_conversation_reads ON conversation_reads
  FOR ALL
  USING (tenant_id = public.current_tenant_id_safe())
  WITH CHECK (tenant_id = public.current_tenant_id_safe());

CREATE POLICY tenant_isolation_meta_connections ON meta_connections
  FOR ALL
  USING (tenant_id = public.current_tenant_id_safe())
  WITH CHECK (tenant_id = public.current_tenant_id_safe());

-- 8. Table Grants for krad_app and krad_recovery roles
DO $$
BEGIN
  -- krad_app grants
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO krad_app;
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO krad_app;

  -- krad_recovery grants: strictly diagnostic
  GRANT SELECT ON audit_logs, meta_webhook_events, meta_connections, schema_migrations TO krad_recovery;
  GRANT UPDATE (status, attempts, lease_until) ON meta_webhook_events TO krad_recovery;
  REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM krad_recovery;
  REVOKE ALL ON chat_messages, conversations, users, wallets, ledger, api_keys FROM krad_recovery;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
