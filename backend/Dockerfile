FROM node:20.11.1-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:20.11.1-slim AS production

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production

RUN npx prisma generate

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated

EXPOSE 3000

CMD [ "npm", "run", "start:prod"]

