ALTER TABLE contact_consent ADD COLUMN opted_in_at TIMESTAMPTZ;
ALTER TABLE contact_consent ADD COLUMN evidence TEXT;
CREATE TABLE consent_events (
 id BIGSERIAL PRIMARY KEY,tenant_id BIGINT NOT NULL REFERENCES tenants(id),phone TEXT NOT NULL,
 opted_in BOOLEAN NOT NULL,source TEXT NOT NULL,evidence TEXT,created_by BIGINT REFERENCES users(id),created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER consent_event_immutable BEFORE UPDATE OR DELETE ON consent_events FOR EACH ROW EXECUTE FUNCTION reject_record_mutation();
CREATE TABLE broadcast_policies (
 tenant_id BIGINT PRIMARY KEY REFERENCES tenants(id),daily_limit INT NOT NULL DEFAULT 1000 CHECK(daily_limit BETWEEN 1 AND 1000000),
 require_approval BOOLEAN NOT NULL DEFAULT true,paused BOOLEAN NOT NULL DEFAULT false
);
CREATE TABLE broadcast_daily_usage (
 tenant_id BIGINT NOT NULL REFERENCES tenants(id),day DATE NOT NULL,dispatches INT NOT NULL DEFAULT 0,PRIMARY KEY(tenant_id,day)
);
ALTER TABLE messages ADD COLUMN dispatch_reserved_at TIMESTAMPTZ;
