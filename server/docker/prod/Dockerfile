FROM node:22-alpine AS builder

USER root
RUN apk add --no-cache openssl
WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN npx prisma generate
RUN yarn build

# Production stage
FROM node:22-alpine AS production

USER root
RUN apk add --no-cache openssl && \
    addgroup -g 1001 -S nestgroup && \
    adduser -S nestjs -u 1001 -G nestgroup

WORKDIR /usr/src/app

# Copy only necessary files from the builder stage
COPY --from=builder --chown=nestjs:nestgroup /usr/src/app/dist ./dist
COPY --from=builder --chown=nestjs:nestgroup /usr/src/app/prisma ./prisma
COPY --from=builder --chown=nestjs:nestgroup /usr/src/app/package.json ./ 
COPY --from=builder --chown=nestjs:nestgroup /usr/src/app/yarn.lock ./ 

# Install only production dependencies
RUN yarn install --production --frozen-lockfile && \
    npx prisma generate && \
    yarn cache clean

USER nestjs

CMD ["yarn", "start:prod"]
