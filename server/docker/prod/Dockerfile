FROM node:22-alpine AS build
RUN apk add --no-cache openssl
WORKDIR /usr/src/app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine
RUN apk add --no-cache openssl
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/package*.json ./
RUN npm install --omit=dev
RUN npx prisma generate

CMD ["npm", "run", "start:prod"]