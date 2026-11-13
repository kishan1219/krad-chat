-- 022_user_profile_and_username.sql: User profile fields, username login, and authority configurations
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS zipcode TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS authority_type INT DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locktimeout INT DEFAULT 30;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_add_webhook BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_detail_report BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_visible_dlt_template_group BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_logo TEXT;

CREATE INDEX IF NOT EXISTS users_user_name_idx ON users(LOWER(user_name)) WHERE user_name IS NOT NULL;
