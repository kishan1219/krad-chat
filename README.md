# krad-chat

Enterprise WhatsApp Cloud API, AI Chatbots & Customer Communication Platform.

`krad-chat` is a high-throughput, multi-tenant messaging SaaS platform that connects businesses to official Meta WhatsApp Cloud API infrastructure. It includes multi-agent team inboxes, automated keyword chatbots, template dispatch engines, wallet-based credit accounting, and enterprise security hardening.

---

## Architecture Overview

- **Backend**: Node.js (v22+) & TypeScript with Express/NestJS architectural patterns, PostgreSQL persistence, AES-256-GCM token encryption, rate limiting, and real-time WebSocket communication.
- **Frontend**: React 18 with Redux Toolkit, React Hook Form, and responsive workspace layouts.
- **Provider Layer**: Pluggable provider abstraction supporting live Meta WhatsApp Cloud API as well as offline/local mock simulation for development and testing.

---

## 1. Local Environment Setup

The local environment can be run entirely on your local machine using an embedded zero-configuration database (PGlite) or local PostgreSQL.

### Prerequisites
- Node.js 22.x or later
- npm 10.x or later

### Step 1: Clone Repository & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/kishan1219/krad-chat.git
cd krad-chat

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install --legacy-peer-deps
cd ..
```

### Step 2: Configure Local Environment
Create your local environment configuration from the provided templates:

**Backend (`backend/.env`):**
```bash
cp backend/.env.example backend/.env
```
Key local settings in `backend/.env`:
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://localhost:5432/krad_chat
CORS_ORIGINS=http://localhost:3000
PUBLIC_API_URL=http://localhost:4000
PROVIDER_MODE=mock
WORKER_ENABLED=true
ADMIN_EMAIL=admin@local.test
ADMIN_PASSWORD=your_secure_local_password
JWT_SECRET=replace_with_a_secure_random_string_at_least_32_chars
ENCRYPTION_KEY=replace_with_64_hex_characters_for_token_encryption
```
> Generate random secrets with:
> `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**Frontend (`frontend/.env`):**
```bash
cp frontend/.env.example frontend/.env
```
Default local settings in `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:4000/api/
REACT_APP_ASSET_URL=http://localhost:4000/
REACT_APP_WS_URL=ws://localhost:4000/ws
REACT_APP_ENABLE_FAKE_DB=false
```

### Step 3: Run Migrations & Start Servers
Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm run build
npm run dev
# Backend API will listen on http://localhost:4000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
# Frontend application will launch on http://localhost:3000
```

---

## 2. Production Deployment Setup

### Infrastructure Prerequisites
- A Linux VPS or Cloud Instance (Ubuntu 22.04 LTS or 24.04 LTS recommended)
- Docker & Docker Compose v2 (or standalone Node.js 22 + PostgreSQL 17)
- Domain name with SSL (via Nginx, Cloudflare, or Caddy)
- A Meta WhatsApp Business Account with approved Cloud API access

### Step 1: Production Environment Configuration
On your production server, create `.env` using secure values:

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://db_user:secure_password@postgres:5432/krad_chat_prod
DATABASE_SSL=false
CORS_ORIGINS=https://chat.yourdomain.com
PUBLIC_API_URL=https://api.yourdomain.com

# Core Security
JWT_SECRET=production_random_jwt_secret_min_64_chars
ENCRYPTION_KEY=production_random_64_hex_character_key
ALLOW_SIGNUP=false
WORKER_ENABLED=true

# Live Messaging Provider
PROVIDER_MODE=live
META_GRAPH_VERSION=v22.0
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_CONFIG_ID=your_embedded_signup_config_id
META_VERIFY_TOKEN=your_secure_webhook_verify_token

# Storage & Email (Optional)
EMAIL_FROM=noreply@yourdomain.com
AWS_REGION=ap-south-1
```

### Step 2: Build & Deployment via Docker Compose
Use the containerized setup for zero-downtime execution:

```bash
# Build and launch production containers
docker compose -f docker-compose.staging.yml up -d --build

# Run database schema migrations
docker compose -f docker-compose.staging.yml exec api npm run migrate
```

### Step 3: Reverse Proxy & HTTPS Configuration (Nginx)
Route traffic securely with SSL to the backend and frontend:

```nginx
# API Backend Reverse Proxy
server {
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

### Step 4: Webhook Configuration
In your Meta WhatsApp App Dashboard:
1. Set Callback URL: `https://api.yourdomain.com/api/webhooks/meta`
2. Set Verify Token: Match `META_VERIFY_TOKEN` from your production environment.
3. Subscribe to webhook fields: `messages`, `message_template_status_update`.

---

## Verification & Testing

Run the automated test suite to verify security hardening, rate limiting, and business logic:
```bash
cd backend
npm test
```
All tests use a self-contained embedded engine and require no external dependencies.

---

## License & Security
Private and proprietary. Never commit `.env` or production credentials to source control.
