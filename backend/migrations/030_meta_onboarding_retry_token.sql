-- Migration 030: Add encrypted access token cache to meta_onboarding_sessions for safe retries
ALTER TABLE meta_onboarding_sessions ADD COLUMN IF NOT EXISTS access_token_encrypted TEXT;
