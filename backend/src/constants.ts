/**
 * Application Constants & Configuration Defaults
 * Centralizes all magic numbers, system timeouts, rate limits, and default policies.
 */

// Cryptographic & Security Constants
export const BCRYPT_SALT_ROUNDS = 12;
export const DEFAULT_HOST = '0.0.0.0';
export const DEFAULT_PORT = 4000;
export const DEFAULT_ADMIN_EMAIL = 'admin@platform.test';

// Financial & Wallet Defaults
export const INITIAL_WALLET_BALANCE_PAISE = 10_000_000; // 100,000 INR
export const MIN_PAYMENT_AMOUNT_PAISE = 100; // 1 INR
export const MAX_PAYMENT_AMOUNT_PAISE = 10_000_000; // 100,000 INR
export const MAX_TRANSFER_AMOUNT_PAISE = 100_000_000; // 1,000,000 INR

// Cache & Storage Limits
export const DEFAULT_CACHE_TTL_MS = 60_000; // 1 minute
export const PRESIGNED_URL_EXPIRES_SECONDS = 300; // 5 minutes
export const MAX_INCOMING_MESSAGE_LENGTH = 10_000;

// Rate Limiting Policies
export const RATE_LIMIT_API = {
  windowMs: 60_000, // 1 minute
  limit: 300,
  message: 'Too many requests. Please try again later.'
};

export const RATE_LIMIT_AUTH = {
  windowMs: 15 * 60_000, // 15 minutes
  limit: 20,
  message: 'Too many authentication attempts. Please try again later.'
};

// File Upload Constraints
export const UPLOAD_LIMITS = {
  fileSize: 10 * 1024 * 1024, // 10 MB
  files: 1,
  fields: 50
};

// Background Worker Tick Interval
export const WORKER_TICK_INTERVAL_MS = 2_000; // 2 seconds

// CSP & External Service Domains
export const DEFAULT_EXTERNAL_ORIGINS = [
  'https://connect.facebook.net',
  'https://graph.facebook.com',
  'https://www.facebook.com',
  'https://web.facebook.com',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com'
];
