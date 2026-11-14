-- 027_meta_display_name_status.sql
-- Track Meta WhatsApp Display Name review status & automated polling

ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS name_status TEXT DEFAULT 'PENDING_REVIEW';
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS last_name_status_check TIMESTAMPTZ;

