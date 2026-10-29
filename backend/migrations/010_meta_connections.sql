CREATE TABLE meta_connections (
 id BIGSERIAL PRIMARY KEY,tenant_id BIGINT NOT NULL REFERENCES tenants(id),
 phone_number_id TEXT NOT NULL UNIQUE,waba_id TEXT NOT NULL,name TEXT NOT NULL,
 display_phone_number TEXT,quality_rating TEXT,token_encrypted TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'connected' CHECK(status IN ('connected','disconnected')),
 subscribed BOOLEAN NOT NULL DEFAULT false,registered BOOLEAN NOT NULL DEFAULT false,
 simulated BOOLEAN NOT NULL DEFAULT false,templates JSONB NOT NULL DEFAULT '[]',
 last_sync_at TIMESTAMPTZ,last_error TEXT,created_by BIGINT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 FOREIGN KEY(created_by,tenant_id) REFERENCES users(id,tenant_id)
);
ALTER TABLE conversations ADD COLUMN phone_number_id TEXT NOT NULL DEFAULT '';
ALTER TABLE conversations DROP CONSTRAINT conversations_tenant_id_phone_key;
ALTER TABLE conversations ADD UNIQUE(tenant_id,phone,phone_number_id);
