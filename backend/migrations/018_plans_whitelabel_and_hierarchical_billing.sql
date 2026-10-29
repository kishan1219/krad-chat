-- 018_plans_whitelabel_and_hierarchical_billing.sql
-- Plans, subscriptions, white-label branding, reseller markups, and hierarchical billing columns

-- Expand ledger types for markup rebate reconciliation
ALTER TABLE ledger DROP CONSTRAINT IF EXISTS ledger_type_check;
ALTER TABLE ledger ADD CONSTRAINT ledger_type_check CHECK(type IN ('credit','reserve','charge','release','refund','transfer_in','transfer_out','markup_rebate'));

-- Add hierarchical markup and parent user references to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS markup_cost BIGINT NOT NULL DEFAULT 0;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS parent_user_id BIGINT;

-- Plans & Pricing table
CREATE TABLE IF NOT EXISTS plans (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_paise INT NOT NULL DEFAULT 0,
  billing_period TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'annual')),
  message_limit INT NOT NULL DEFAULT 1000,
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions table (linking tenant to plan)
CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) UNIQUE,
  plan_id BIGINT NOT NULL REFERENCES plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  renews_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  current_period_messages INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reseller Markups table
CREATE TABLE IF NOT EXISTS reseller_markups (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id),
  reseller_id BIGINT NOT NULL REFERENCES users(id),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'voice')),
  markup_paise INT NOT NULL DEFAULT 0,
  markup_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(reseller_id, channel)
);

-- White-label Configurations table
CREATE TABLE IF NOT EXISTS white_label_configs (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) UNIQUE,
  reseller_id BIGINT REFERENCES users(id),
  domain TEXT UNIQUE,
  company_name TEXT NOT NULL DEFAULT 'Messaging Platform',
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#25D366',
  accent_color TEXT NOT NULL DEFAULT '#128C7E',
  email_sender_name TEXT NOT NULL DEFAULT 'Support',
  support_email TEXT NOT NULL DEFAULT 'support@messaging.test',
  email_footer TEXT,
  custom_css TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_white_label_domain ON white_label_configs(domain);
CREATE INDEX IF NOT EXISTS idx_reseller_markups_reseller ON reseller_markups(reseller_id);
