CREATE TABLE api_keys (
 id UUID PRIMARY KEY, tenant_id BIGINT NOT NULL, user_id BIGINT NOT NULL,
 key_hash TEXT NOT NULL UNIQUE, scopes TEXT[] NOT NULL, allowed_ips TEXT[] NOT NULL DEFAULT '{}',
 revoked_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 FOREIGN KEY(user_id,tenant_id) REFERENCES users(id,tenant_id)
);
CREATE TABLE notification_reads (
 resource_id BIGINT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
 user_id BIGINT NOT NULL REFERENCES users(id), read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(resource_id,user_id)
);
CREATE TABLE resource_assignments (
 resource_id BIGINT NOT NULL, tenant_id BIGINT NOT NULL, user_id BIGINT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY(resource_id,user_id),
 FOREIGN KEY(resource_id,tenant_id) REFERENCES resources(id,tenant_id) ON DELETE CASCADE,
 FOREIGN KEY(user_id,tenant_id) REFERENCES users(id,tenant_id)
);
