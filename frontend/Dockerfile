# syntax=docker/dockerfile:1

# ---- Dependencies -------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
# Install against the lockfile only, cached until it changes.
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build --------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# next.config's rewrites() bakes the backend URL into routes-manifest.json at
# BUILD time — a runtime env var is ignored. So the API origin must be set
# here, as a build arg, per target environment.
ARG BACKEND_URL=http://localhost:8000
ENV BACKEND_URL=$BACKEND_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Runtime ------------------------------------------------------------
# Uses Next's standalone output: a minimal server with only the deps it
# actually imports. No node_modules copy, no source tree.
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# BACKEND_URL is read at server start by next.config's rewrites() — set it
# to the deployed API origin at run time.
CMD ["node", "server.js"]
