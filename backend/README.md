# Messaging backend

NestJS/TypeScript API with PostgreSQL persistence, a durable PostgreSQL campaign queue, revocable JWT sessions, tenant isolation, permission checks, credit reservations and ledger entries, mock/live provider adapters, private files, CSV imports/exports, and WebSocket updates.

**Status:** runnable backend foundation with implemented business flows. This is not yet a complete replacement for every legacy frontend operation. See [API coverage](docs/API_COVERAGE.md) and [integration notes](docs/INTEGRATION.md). Live providers, concurrency on a standalone PostgreSQL server, and the complete React UI must be validated before production.

## Local setup

Requires Node 22+ and PostgreSQL 17+. Docker Compose is provided as an optional way to run PostgreSQL.

1. Run `npm ci` in this directory.
2. Copy `.env.example` to `.env`.
3. Set a random `JWT_SECRET`, a 64-character hex `ENCRYPTION_KEY`, and a unique administrator password. Generate keys with:
   - `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
   - `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
4. Start PostgreSQL: `docker compose up -d postgres`, or supply an existing `DATABASE_URL`.
5. Run `npm run migrate`, then `npm run bootstrap` (once).
6. Run `npm run dev`. API: `http://localhost:4000/api`. Socket: `ws://localhost:4000/ws`.

No administrator password or working production secret ships in the repository. `.env` is ignored. `PROVIDER_MODE=mock` never contacts messaging/payment/email providers. A mock delivered status is simulated, not proof of real delivery.

## Verification

- `npm run build`: strict TypeScript compilation.
- `npm test`: unit and PostgreSQL-engine integration tests using PGlite. Tests need no credentials or installed database. They do not verify concurrent connections, advisory locking, real provider behavior, or full frontend compatibility.
- `npm run inventory -- path/to/frontend/src/utility/http/ApiEndpoints.tsx`: regenerate endpoint coverage.

## First campaign

Use any HTTP client:

1. `POST /api/login` with `{ "email": "your-admin-email", "password": "your-admin-password" }`.
2. Read `data.access_token`; send `Authorization: Bearer <token>` on subsequent requests.
3. `POST /api/user-credit` with `{ "amount_paise": 100000, "reference": "initial-test-credit-001" }`. This allocates ₹1,000 to the administrator's wallet. Administrators can target a user's wallet with `user_id`.
4. `POST /api/send-sms`, header `Idempotency-Key: first-campaign-001`, body `{ "name": "Test", "message": "Hello", "recipients": ["+919876543210"] }`.
5. `POST /api/campaign-list` to list campaigns; `GET /api/get-campaign-info/<id>` for counts; `GET /api/wallet` for remaining funds.

Amounts are integer paise. The current pilot policy charges accepted submissions, not only delivered messages. Provider failures after acceptance do not automatically refund credits. Voice currently uses a fixed configured submission price, not duration-based billing. Set these commercial policies before selling credits.

## Reseller wallets

Each user has a separate wallet. Admins can allocate externally funded credits. Resellers create child users with permissions no broader than their own, and transfer their own unreserved credits using `POST /api/credits/transfer` with `to_user_id`, `amount_paise`, and an idempotent `reference`. Transfers are atomic and cannot mint credits. Hierarchy-scoped user, campaign, report and ledger queries prevent siblings from accessing one another's accounts. Resources such as contacts/templates are currently shared within a business; per-user ownership for those resources needs a separate integration decision. Multiple channel-specific balances/rate overrides and reseller margin accounting are not yet implemented.

## Production

- Set `NODE_ENV=production`, `PROVIDER_MODE=live`, explicit HTTPS public URL/CORS origins, strong secrets, and provider credentials.
- Run migration as a deployment step, then `npm run build` and `npm start`.
- Bind is loopback by default; put a trusted reverse proxy with HTTPS in front. Configure proxy trust only for your actual network topology and retest rate limiting.
- Put PostgreSQL on a private network, use verified TLS for remote database connections, and test restore from backups.
- Supply live storage/email credentials and request provider production approvals.
- Confirm account-specific callback schemas against the provider sandbox. See integration notes.
- Monitor failed/uncertain messages, stuck exports, queue backlog, and ledger invariants. Reconcile uncertain submissions before any resend.
- A server crash between external acceptance and recording the response leaves an uncertain message; credits remain reserved until operator reconciliation. This prevents automatic duplicate delivery.
- Keep the queue bounded: pilot campaigns accept at most 10,000 destinations; exports at most 50,000 rows. Benchmark before raising limits.
- Meta credentials are encrypted per business connection. Number/WABA ownership is checked before saving, and each incoming conversation retains its business sender. Embedded Signup has signed, login-bound, one-use state and server-side code exchange. Live SDK and provider acceptance remain unverified.

## External references

- MSG91: https://docs.msg91.com/sms/send-sms
- Exotel voice: https://developer.exotel.com/api-console/voice
- Razorpay webhook verification: https://razorpay.com/docs/webhooks/validate-test/
- Meta pricing/onboarding: https://whatsappbusiness.com/products/platform-pricing/

Provider adapters are integration code, not a guarantee that live account activation is complete. API keys alone do not substitute for approved templates, configured callback URLs, registered numbers, payment onboarding, or email DNS verification.
