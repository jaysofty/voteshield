FROM node:22-alpine AS base

WORKDIR /app

# -----------------------------
# Dependencies
# -----------------------------
FROM base AS deps

COPY package.json package-lock.json ./

RUN npm ci

# -----------------------------
# Build
# -----------------------------
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules

COPY . .

# Build-time environment variables
ARG COGNODB_URI
ARG COGNODB_USERNAME
ARG COGNODB_PASSWORD

ENV COGNODB_URI=$COGNODB_URI
ENV COGNODB_USERNAME=$COGNODB_USERNAME
ENV COGNODB_PASSWORD=$COGNODB_PASSWORD

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# -----------------------------
# Production
# -----------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs \
  /app/.next/standalone ./

COPY --from=builder --chown=nextjs:nodejs \
  /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]