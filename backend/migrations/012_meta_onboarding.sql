CREATE TABLE meta_onboarding_sessions (
 id TEXT PRIMARY KEY,tenant_id BIGINT NOT NULL,user_id BIGINT NOT NULL,session_hash TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'issued' CHECK(status IN ('issued','exchanging','completed','failed')),
 expires_at TIMESTAMPTZ NOT NULL,connection_id BIGINT REFERENCES meta_connections(id),error TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),completed_at TIMESTAMPTZ,
 FOREIGN KEY(user_id,tenant_id) REFERENCES users(id,tenant_id)
);
