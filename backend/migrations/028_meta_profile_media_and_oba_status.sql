-- Migration 028: Meta WhatsApp Business Profile Media CDN and OBA Status
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS oba_status TEXT DEFAULT 'NOT_ELIGIBLE';
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS profile_picture_handle TEXT;
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS profile_about TEXT;
