# Complete Cloudflare & GitHub CI/CD Deployment Guide

This guide details the complete end-to-end architecture, configuration, and automated deployment pipeline connecting **GitHub** and **Cloudflare** for the **Krad Chat** platform (Frontend SPA, Backend API, PostgreSQL Database, and Custom Domains).

---

## 1. Problem Diagnosis & Resolution: Cloudflare Build `EMFILE: too many open files`

### Why Did the Cloudflare Build Fail?
In Cloudflare Workers Builds (or Cloudflare Pages), the build environment detected `frontend/package-lock.json` and automatically executed:
```bash
Installing project dependencies: npm clean-install --progress=false
```
1. **Unpinned Node 24 & npm 10 Concurrency**: In Node 24 (`nodejs@24.18.0` / `npm@10.9.2`), `npm clean-install` concurrently extracts thousands of packages into `/opt/buildhome/.npm/_cacache/`, exhausting the Linux container's file descriptor limit (`nofile` / `ulimit -n`).
2. **Missing Bun Lockfile**: Although `"packageManager": "bun@1.2.15"` was declared in `package.json`, Cloudflare's build image prioritizes `package-lock.json` unless `bun.lock` or `bun.lockb` exists.
3. **Peer Dependency Strains**: CRA/Craco and React 19 peer dependencies strained file operations without `--legacy-peer-deps`.

### How It Has Been Solved
1. **Generated `bun.lock`**:
   - `frontend/bun.lock` (and root `bun.lock`) has been generated and committed.
   - When Cloudflare's build system detects `bun.lock`, it uses `bun install`, which takes ~2 seconds and uses minimal file descriptors, completely bypassing the EMFILE bug.
2. **Added Concurrency Throttles to `.npmrc`**:
   - `legacy-peer-deps=true`, `maxsockets=5`, and `fetch-retries=5` are enforced in `frontend/.npmrc` and root `.npmrc`.
3. **Provided Pre-packaged Wrangler**:
   - `wrangler@^4.158.0` is now added directly to `frontend/package.json` devDependencies so `npx` does not need to download it over the network during every deployment.
4. **Automated GitHub Actions CI/CD (`.github/workflows/deploy.yml`)**:
   - Provides an independent, rock-solid pipeline using official Cloudflare Actions (`cloudflare/wrangler-action@v3`).

---

## 2. GitHub Actions CI/CD Pipeline

The repository includes an enterprise-grade CI/CD pipeline in `.github/workflows/deploy.yml` that triggers automatically on every push to `main` (and supports manual execution via `workflow_dispatch`):

```
[git push to main]
        |
        +---> Job 1: test-and-verify
        |       - Node 22 build validation (tsc)
        |       - 21 Database migrations verified
        |       - 105 Unit & Integration tests executed (PGlite)
        |
        +---> Job 2: security-audit
        |       - Verifies zero private .env files or hardcoded credentials
        |
        +---> Job 3: deploy-frontend-cloudflare
        |       - Bun runtime setup
        |       - Optimized frontend production build (no source maps, max-old-space-size=4096)
        |       - Deploys static assets to Cloudflare Workers via Wrangler Action
        |
        +---> Job 4: production-database-migrations
                - Connects to remote PostgreSQL via DATABASE_URL
                - Safely executes all pending migrations with advisory locking
```

### GitHub Repository Secrets Setup
Navigate to **GitHub > Repository > Settings > Secrets and variables > Actions** and add the following repository secrets:

| Secret Name | Required | Description |
| :--- | :--- | :--- |
| `CLOUDFLARE_API_TOKEN` | **Yes** | Cloudflare API token with `Cloudflare Workers:Edit` or `Cloudflare Pages:Edit` permissions. |
| `CLOUDFLARE_ACCOUNT_ID` | **Yes** | Your Cloudflare Account ID (found in Cloudflare dashboard URL or Workers overview). |
| `REACT_APP_API_URL` | Optional | Public Backend API URL, e.g. `https://api.yourdomain.com/api/` |
| `REACT_APP_ASSET_URL` | Optional | Public Backend Media URL, e.g. `https://api.yourdomain.com/` |
| `REACT_APP_WS_URL` | Optional | Public WebSocket URL, e.g. `wss://api.yourdomain.com/ws` |
| `DATABASE_URL` | Optional | Remote PostgreSQL connection string for automated migrations. |
| `DATABASE_SSL` | Optional | Set to `true` for managed PostgreSQL (Supabase, Neon, AWS RDS). |
| `JWT_SECRET` | Optional | Secret key for backend authentication. |
| `ENCRYPTION_KEY` | Optional | 64-hex-character AES-256 key for sensitive token encryption. |

---

## 3. Cloudflare Dashboard Native Builds Setup (Alternative to GitHub Actions)

If you prefer using Cloudflare's native Workers / Pages Git integration directly in the Cloudflare Dashboard:

1. Go to **Cloudflare Dashboard** > **Workers & Pages** > **Create application** > **Pages** or **Workers**.
2. Connect your GitHub repository: `kishan1219/krad-chat`.
3. Configure the **Build Settings**:
   - **Framework preset**: `Create React App` or `None`
   - **Build command**: `bun install && npm run build`
   - **Deploy command**: `npx wrangler deploy`
   - **Root directory**: `frontend`
4. Expand **Environment variables** (Build variables) and configure:
   - `NODE_VERSION`: `20`
   - `NPM_FLAGS`: `--legacy-peer-deps`
   - `CI`: `false`
   - `GENERATE_SOURCEMAP`: `false`
   - `NODE_OPTIONS`: `--max-old-space-size=4096`
   - `REACT_APP_API_URL`: `https://api.yourdomain.com/api/`
   - `REACT_APP_ASSET_URL`: `https://api.yourdomain.com/`
   - `REACT_APP_WS_URL`: `wss://api.yourdomain.com/ws`
   - `REACT_APP_ENABLE_FAKE_DB`: `false`
5. Click **Save and Deploy**. With `frontend/bun.lock` in place, the install phase completes in ~2 seconds.

---

## 4. Backend & Database Architecture

The backend is an enterprise Node.js 22 / Express / NestJS application requiring stateful WebSocket connections, background worker timers, and persistent PostgreSQL persistence.

### Option A: Cloudflare Tunnel + Docker (Recommended)
This architecture exposes **zero inbound open ports** to the public internet:

```
[Internet / Meta API] 
         │  HTTPS (Port 443)
         ▼
[Cloudflare Global Edge] (DDoS protection, WAF, SSL termination)
         │  Encrypted outbound tunnel (cloudflared)
         ▼
[Your Linux VPS / Server]
   ├── [cloudflared] (Tunnel agent connected to Cloudflare)
   ├── [Docker: API Backend] (Port 4000, NestJS / Express)
   └── [Docker: PostgreSQL 17] (Port 5432, 21 automated migrations)
```

#### Step 1: Create a Cloudflare Tunnel
1. In Cloudflare Zero Trust Dashboard > **Networks** > **Tunnels** > **Create a tunnel**.
2. Name the tunnel: `krad-chat-backend`.
3. Copy the tunnel token (`TUNNEL_TOKEN`).
4. Under **Public Hostname**:
   - Subdomain: `api`
   - Domain: `yourdomain.com`
   - Service: `HTTP` -> `api:4000`

#### Step 2: Deploy with Docker Compose
On your server:
```bash
git clone https://github.com/kishan1219/krad-chat.git
cd krad-chat

# Create your production environment file
cp .env.example .env.production
# Fill in DB_PASSWORD, JWT_SECRET, ENCRYPTION_KEY, CLOUDFLARE_TUNNEL_TOKEN

# Start all services (PostgreSQL, Backend API, Cloudflare Tunnel)
docker compose -f docker-compose.staging.yml --env-file .env.production up -d --build

# Run database migrations
docker compose -f docker-compose.staging.yml exec api npm run migrate
```

### Option B: Managed Container (Render / Railway) + Managed PostgreSQL (Supabase / Neon)
1. **Database**: Create a database on Supabase or Neon.
   - Copy connection string: `postgresql://user:password@host:5432/dbname?sslmode=require`.
2. **Backend**: Deploy `backend/Dockerfile` on Render or Railway.
   - Set environment variables (`DATABASE_URL`, `DATABASE_SSL=true`, `JWT_SECRET`, `ENCRYPTION_KEY`).
   - The backend runs auto-migrations on startup (`await migrate(db)` in `backend/src/main.ts`).
3. **Cloudflare DNS**:
   - Add a CNAME record in Cloudflare DNS for `api.yourdomain.com` pointing to your Render/Railway hostname with the Cloudflare Proxy (Orange Cloud) turned **ON**.

---

## 5. Domain Configuration on Cloudflare

1. **Add Your Domain**:
   - In Cloudflare Dashboard, add `yourdomain.com`.
   - Update your domain registrar's nameservers to Cloudflare's assigned nameservers.
2. **Frontend Custom Domain**:
   - In Cloudflare Dashboard > **Workers & Pages** > `krad-chat` > **Settings** > **Domains & Routes** > **Add Custom Domain**.
   - Enter `chat.yourdomain.com` or `yourdomain.com`.
   - Cloudflare will automatically configure the SSL certificate and DNS CNAME record.
3. **Backend API Custom Domain**:
   - Route `api.yourdomain.com` to your Cloudflare Tunnel hostname or backend container CNAME.
4. **Meta WhatsApp Cloud API Webhook**:
   - In Meta Developer Dashboard > **WhatsApp** > **Configuration**:
     - **Callback URL**: `https://api.yourdomain.com/api/webhooks/meta`
     - **Verify Token**: Same as `META_VERIFY_TOKEN` configured in your backend environment.
     - **Webhook Fields**: Subscribe to `messages` and `message_template_status_update`.
