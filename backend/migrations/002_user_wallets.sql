ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK(role IN ('admin','reseller','operator','viewer'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_user_id BIGINT;
ALTER TABLE users ADD CONSTRAINT users_parent_same_tenant FOREIGN KEY(parent_user_id,tenant_id) REFERENCES users(id,tenant_id);
ALTER TABLE users ADD CONSTRAINT users_not_own_parent CHECK(parent_user_id IS NULL OR parent_user_id != id);

ALTER TABLE wallets ADD COLUMN IF NOT EXISTS user_id BIGINT;
UPDATE wallets w SET user_id=(SELECT u.id FROM users u WHERE u.tenant_id=w.tenant_id ORDER BY u.id LIMIT 1) WHERE user_id IS NULL;
ALTER TABLE wallets DROP CONSTRAINT IF EXISTS wallets_pkey;
ALTER TABLE wallets ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE wallets ADD PRIMARY KEY(user_id);
ALTER TABLE wallets ADD CONSTRAINT wallets_user_tenant FOREIGN KEY(user_id,tenant_id) REFERENCES users(id,tenant_id);
INSERT INTO wallets(tenant_id,user_id) SELECT tenant_id,id FROM users ON CONFLICT(user_id) DO NOTHING;

ALTER TABLE ledger ADD COLUMN IF NOT EXISTS user_id BIGINT;
UPDATE ledger l SET user_id=(SELECT u.id FROM users u WHERE u.tenant_id=l.tenant_id ORDER BY u.id LIMIT 1) WHERE user_id IS NULL;
ALTER TABLE ledger ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE ledger ADD CONSTRAINT ledger_user_tenant FOREIGN KEY(user_id,tenant_id) REFERENCES users(id,tenant_id);
ALTER TABLE ledger DROP CONSTRAINT IF EXISTS ledger_type_check;
ALTER TABLE ledger ADD CONSTRAINT ledger_type_check CHECK(type IN ('credit','reserve','charge','release','refund','transfer_in','transfer_out'));
ALTER TABLE ledger DROP CONSTRAINT IF EXISTS ledger_tenant_id_type_reference_key;
ALTER TABLE ledger ADD UNIQUE(user_id,type,reference);

ALTER TABLE messages ADD COLUMN IF NOT EXISTS user_id BIGINT;
UPDATE messages m SET user_id=c.user_id FROM campaigns c WHERE c.id=m.campaign_id;
ALTER TABLE messages ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE messages ADD CONSTRAINT messages_user_tenant FOREIGN KEY(user_id,tenant_id) REFERENCES users(id,tenant_id);
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_tenant_id_idempotency_key_key;
ALTER TABLE campaigns ADD UNIQUE(user_id,idempotency_key);

ALTER TABLE payment_orders ADD COLUMN IF NOT EXISTS user_id BIGINT;
UPDATE payment_orders p SET user_id=(SELECT u.id FROM users u WHERE u.tenant_id=p.tenant_id ORDER BY u.id LIMIT 1) WHERE user_id IS NULL;
ALTER TABLE payment_orders ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE payment_orders ADD CONSTRAINT payments_user_tenant FOREIGN KEY(user_id,tenant_id) REFERENCES users(id,tenant_id);

ALTER TABLE exports ADD COLUMN IF NOT EXISTS user_id BIGINT;
UPDATE exports e SET user_id=(SELECT u.id FROM users u WHERE u.tenant_id=e.tenant_id ORDER BY u.id LIMIT 1) WHERE user_id IS NULL;
ALTER TABLE exports ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE exports ADD CONSTRAINT exports_user_tenant FOREIGN KEY(user_id,tenant_id) REFERENCES users(id,tenant_id);

CREATE TABLE credit_transfers (
 id UUID PRIMARY KEY, tenant_id BIGINT NOT NULL REFERENCES tenants(id), from_user_id BIGINT NOT NULL, to_user_id BIGINT NOT NULL,
 amount BIGINT NOT NULL CHECK(amount>0), reference TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 FOREIGN KEY(from_user_id,tenant_id) REFERENCES users(id,tenant_id), FOREIGN KEY(to_user_id,tenant_id) REFERENCES users(id,tenant_id),
 UNIQUE(from_user_id,reference), CHECK(from_user_id!=to_user_id)
);
