CREATE TABLE meta_webhook_events (
 id BIGSERIAL PRIMARY KEY, event_hash TEXT NOT NULL UNIQUE,
 tenant_id BIGINT REFERENCES tenants(id), phone_number_id TEXT,
 payload JSONB NOT NULL, status TEXT NOT NULL DEFAULT 'queued'
 CHECK(status IN ('queued','running','completed','failed','quarantined')),
 attempts INT NOT NULL DEFAULT 0, available_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 lease_until TIMESTAMPTZ, error TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), completed_at TIMESTAMPTZ
);
CREATE INDEX meta_webhook_queue ON meta_webhook_events(status,available_at,id);
