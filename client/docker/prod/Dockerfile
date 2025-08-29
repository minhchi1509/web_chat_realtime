# Deps
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY ./docker/prod/.env.prod .env.production
RUN yarn build

# Runner
FROM node:22-alpine AS runner
WORKDIR /app

# Tạo user non-root
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Thư mục .next phải có quyền truy cập
RUN mkdir .next && chown nextjs:nodejs .next

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone server và static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

CMD ["node", "server.js"]
