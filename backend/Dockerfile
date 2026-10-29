# Stage 1: Build TypeScript backend
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
COPY migrations/ ./migrations/
RUN npm run build

# Stage 2: Production runtime
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations

EXPOSE 4000
CMD ["node", "dist/main.js"]
