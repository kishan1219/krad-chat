CREATE TABLE invitations (
 id BIGSERIAL PRIMARY KEY, tenant_id BIGINT NOT NULL REFERENCES tenants(id),
 email TEXT NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('operator','viewer')),
 permissions TEXT[] NOT NULL DEFAULT '{}', token_hash TEXT NOT NULL UNIQUE,
 invited_by BIGINT NOT NULL, expires_at TIMESTAMPTZ NOT NULL,
 accepted_at TIMESTAMPTZ, revoked_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 FOREIGN KEY(invited_by,tenant_id) REFERENCES users(id,tenant_id)
);
CREATE INDEX invitations_tenant ON invitations(tenant_id,id DESC);
