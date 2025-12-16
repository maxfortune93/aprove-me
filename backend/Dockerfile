FROM node:20.11.1-slim AS builder

WORKDIR /app

# Build argument para DATABASE_URL
# ARG DATABASE_URL=file:/app/data/dev.db
ARG DATABASE_URL=file:/app/dev.db
ENV DATABASE_URL=${DATABASE_URL}

COPY package*.json ./
COPY prisma ./prisma/
# RUN npm ci
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit

COPY . .

RUN npx prisma generate
RUN npm run build


FROM node:20.11.1-slim AS production

WORKDIR /app

# Criar diretório para dados do banco
# RUN mkdir -p /app/data

# Build argument para DATABASE_URL
# ARG DATABASE_URL=file:/app/data/dev.db
ARG DATABASE_URL=file:/app/dev.db
ENV DATABASE_URL=${DATABASE_URL}

COPY package*.json ./
COPY prisma ./prisma/
# RUN npm ci --only=production
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production --prefer-offline --no-audit

RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Executar migrations e iniciar aplicação
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
