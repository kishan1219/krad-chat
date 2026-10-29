CREATE TABLE IF NOT EXISTS tenants (
 id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS users (
 id BIGSERIAL PRIMARY KEY, tenant_id BIGINT NOT NULL REFERENCES tenants(id), email TEXT NOT NULL UNIQUE,
 name TEXT NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('admin','operator','viewer')),
 permissions TEXT[] NOT NULL DEFAULT '{}', active BOOLEAN NOT NULL DEFAULT true, otp_enabled BOOLEAN NOT NULL DEFAULT false,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(id, tenant_id)
);
CREATE TABLE IF NOT EXISTS sessions (
 id UUID PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id), expires_at TIMESTAMPTZ NOT NULL,
 revoked_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS auth_tokens (
 id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id), kind TEXT NOT NULL,
 token_hash TEXT NOT NULL UNIQUE, expires_at TIMESTAMPTZ NOT NULL, used_at TIMESTAMPTZ,
 attempts INT NOT NULL DEFAULT 0, challenge TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS wallets (
 tenant_id BIGINT PRIMARY KEY REFERENCES tenants(id), balance BIGINT NOT NULL DEFAULT 0 CHECK(balance >= 0),
 reserved BIGINT NOT NULL DEFAULT 0 CHECK(reserved >= 0 AND reserved <= balance)
);
CREATE TABLE IF NOT EXISTS resources (
 id BIGSERIAL PRIMARY KEY, tenant_id BIGINT NOT NULL REFERENCES tenants(id), kind TEXT NOT NULL,
 data JSONB NOT NULL, created_by BIGINT NOT NULL REFERENCES users(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(id, tenant_id)
);
CREATE INDEX IF NOT EXISTS resources_tenant_kind ON resources(tenant_id,kind,id DESC);
CREATE INDEX IF NOT EXISTS resources_data ON resources USING gin(data);
CREATE TABLE IF NOT EXISTS campaigns (
 id BIGSERIAL PRIMARY KEY, tenant_id BIGINT NOT NULL REFERENCES tenants(id), user_id BIGINT NOT NULL REFERENCES users(id),
 channel TEXT NOT NULL CHECK(channel IN ('sms','whatsapp','voice')), name TEXT NOT NULL, payload JSONB NOT NULL,
 status TEXT NOT NULL DEFAULT 'queued', scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 idempotency_key TEXT NOT NULL, request_hash TEXT NOT NULL, total INT NOT NULL, cost BIGINT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,idempotency_key), UNIQUE(id,tenant_id)
);
CREATE INDEX IF NOT EXISTS campaigns_tenant ON campaigns(tenant_id,id DESC);
CREATE TABLE IF NOT EXISTS messages (
 id BIGSERIAL PRIMARY KEY, campaign_id BIGINT NOT NULL, tenant_id BIGINT NOT NULL,
 recipient TEXT NOT NULL, channel TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'queued', cost BIGINT NOT NULL CHECK(cost >= 0),
 provider TEXT, provider_id TEXT, error TEXT, attempts INT NOT NULL DEFAULT 0, lease_until TIMESTAMPTZ,
 next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(), charged BOOLEAN NOT NULL DEFAULT false,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 FOREIGN KEY(campaign_id,tenant_id) REFERENCES campaigns(id,tenant_id), UNIQUE(campaign_id,recipient)
);
CREATE UNIQUE INDEX IF NOT EXISTS messages_provider_id ON messages(provider,provider_id) WHERE provider_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS messages_queue ON messages(next_attempt_at,id) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS messages_tenant ON messages(tenant_id,id DESC);
CREATE TABLE IF NOT EXISTS ledger (
 id BIGSERIAL PRIMARY KEY, tenant_id BIGINT NOT NULL REFERENCES tenants(id),
 type TEXT NOT NULL CHECK(type IN ('credit','reserve','charge','release','refund')),
 amount BIGINT NOT NULL CHECK(amount > 0), reference TEXT NOT NULL, created_by BIGINT REFERENCES users(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(tenant_id,type,reference)
);
CREATE TABLE IF NOT EXISTS delivery_events (
 id BIGSERIAL PRIMARY KEY, provider TEXT NOT NULL, event_key TEXT NOT NULL, message_id BIGINT REFERENCES messages(id),
 payload JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(provider,event_key)
);
CREATE TABLE IF NOT EXISTS conversations (
 id BIGSERIAL PRIMARY KEY, tenant_id BIGINT NOT NULL REFERENCES tenants(id), phone TEXT NOT NULL,
 name TEXT, updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(tenant_id,phone), UNIQUE(id,tenant_id)
);
CREATE TABLE IF NOT EXISTS chat_messages (
 id BIGSERIAL PRIMARY KEY, tenant_id BIGINT NOT NULL, conversation_id BIGINT NOT NULL,
 direction TEXT NOT NULL CHECK(direction IN ('in','out')), message TEXT NOT NULL, provider_id TEXT UNIQUE,
 status TEXT NOT NULL DEFAULT 'received', created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 FOREIGN KEY(conversation_id,tenant_id) REFERENCES conversations(id,tenant_id)
);
CREATE TABLE IF NOT EXISTS files (
 id UUID PRIMARY KEY, tenant_id BIGINT NOT NULL REFERENCES tenants(id), name TEXT NOT NULL,
 mime TEXT NOT NULL, size BIGINT NOT NULL, storage_key TEXT NOT NULL UNIQUE, storage TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS exports (
 id UUID PRIMARY KEY, tenant_id BIGINT NOT NULL REFERENCES tenants(id), status TEXT NOT NULL DEFAULT 'queued',
 filters JSONB NOT NULL, file_id UUID REFERENCES files(id), error TEXT, lease_until TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS payment_orders (
 id TEXT PRIMARY KEY, tenant_id BIGINT NOT NULL REFERENCES tenants(id), amount BIGINT NOT NULL CHECK(amount > 0),
 currency TEXT NOT NULL DEFAULT 'INR', status TEXT NOT NULL DEFAULT 'created',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS audit_logs (
 id BIGSERIAL PRIMARY KEY, tenant_id BIGINT REFERENCES tenants(id), user_id BIGINT REFERENCES users(id),
 action TEXT NOT NULL, target TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
