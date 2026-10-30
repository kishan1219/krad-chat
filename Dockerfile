# Multi-stage build for Krad Chat Platform backend
FROM node:22-alpine AS builder
WORKDIR /app/backend

# Copy backend dependencies definition
COPY backend/package*.json ./
RUN npm ci

# Copy TypeScript config, source code, and migrations
COPY backend/tsconfig.json ./
COPY backend/src/ ./src/
COPY backend/migrations/ ./migrations/

# Build backend
RUN npm run build

# Stage 2: Production runtime
FROM node:22-alpine AS runner
WORKDIR /app/backend
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4000

COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/migrations ./migrations
COPY --from=builder /app/backend/migrations /app/migrations

EXPOSE 4000
CMD ["node", "dist/main.js"]
