FROM node:22-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:22-alpine AS production
RUN apk add --no-cache openssl && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001
WORKDIR /usr/src/app

# Copy only necessary files from the builder stage
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npx prisma generate && \
    npm cache clean --force

USER nestjs

# Use the start:prod script from package.json
CMD ["npm", "run", "start:prod"]