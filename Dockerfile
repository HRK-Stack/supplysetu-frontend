FROM node:22-slim AS base

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

# ---------- deps ----------
FROM base AS deps

COPY package.json pnpm-lock.yaml ./

RUN pnpm config set fetch-retries 10 && \
    pnpm config set fetch-retry-factor 2 && \
    pnpm config set fetch-timeout 600000 && \
    pnpm install --frozen-lockfile

# ---------- builder ----------
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

# ---------- runner ----------
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY .env.production .env.production

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]