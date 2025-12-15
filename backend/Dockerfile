FROM node:20.11.1-slim AS builder

WORKDIR /app

# Build argument para DATABASE_URL
ARG DATABASE_URL=file:/app/data/dev.db
ENV DATABASE_URL=${DATABASE_URL}

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Verificar se o build gerou o arquivo
RUN echo "=== Conteúdo do dist após build ===" && \
    ls -la /app/dist/ && \
    echo "=== Arquivos main* ===" && \
    (ls -la /app/dist/main* 2>&1 || echo "Nenhum arquivo main* encontrado") && \
    echo "=== Todos os arquivos .js no dist ===" && \
    find /app/dist -name "*.js" -type f | head -20

FROM node:20.11.1-slim AS production

WORKDIR /app

# Criar diretório para dados do banco
RUN mkdir -p /app/data

# Build argument para DATABASE_URL
ARG DATABASE_URL=file:/app/data/dev.db
ENV DATABASE_URL=${DATABASE_URL}

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production

RUN npx prisma generate

COPY --from=builder /app/dist ./dist

# Verificar se o arquivo foi copiado
RUN echo "=== Conteúdo do dist após copy ===" && \
    ls -la /app/dist/ && \
    echo "=== Arquivos main* ===" && \
    (ls -la /app/dist/main* 2>&1 || echo "Nenhum arquivo main* encontrado") && \
    echo "=== Todos os arquivos .js no dist ===" && \
    find /app/dist -name "*.js" -type f | head -20

EXPOSE 3000

# Executar migrations e iniciar aplicação
CMD npx prisma migrate deploy && npm run start:prod