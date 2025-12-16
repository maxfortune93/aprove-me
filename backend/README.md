# Backend - Aprove-me

API desenvolvida com NestJS para gerenciamento de recebíveis (payables) e cedentes (assignors).

## 🚀 Tecnologias

- **NestJS** - Framework Node.js
- **Prisma** - ORM para banco de dados
- **SQLite** - Banco de dados
- **TypeScript** - Linguagem de programação
- **class-validator** - Validação de dados
- **Logger Customizado** - Sistema de logs estruturado com suporte a JSON
- **Bull** - Sistema de filas baseado em Redis (portável multi-cloud)
- **Redis** - Banco de dados em memória para filas
- **Nodemailer** - Envio de emails

## 📋 Pré-requisitos

### Para desenvolvimento local:
- Node.js (v18 ou superior)
- npm ou yarn
- Redis (opcional, pode usar Docker)

### Para Docker:
- Docker (v20 ou superior)
- Docker Compose (v2 ou superior)

## 🔧 Instalação e Configuração

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do diretório `backend` com as seguintes variáveis:

```env
# Database
DATABASE_URL="file:./dev.db"

# Server
PORT=3000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1h

# Logger
LOG_LEVEL=DEBUG          # ERROR, WARN, LOG, DEBUG, VERBOSE
LOG_FORMAT=color         # json (produção) ou color (desenvolvimento)

# Redis (para filas)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=          # Opcional

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false        # true para porta 465
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha
SMTP_FROM=noreply@aproveme.com

# Notificações
BATCH_NOTIFICATION_EMAIL=operations@aproveme.com
DLQ_NOTIFICATION_EMAIL=operations@aproveme.com

# CORS
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000
```

### 3. Configurar banco de dados

```bash
# Gerar Prisma Client
npm run prisma:generate

# Criar/atualizar banco de dados
npm run prisma:migrate

# Visualizar banco de dados (opcional)
npm run prisma:studio
```

## 🏃 Executando Localmente

### Opção 1: Com Redis local

Se você tem Redis instalado localmente:

```bash
# 1. Iniciar Redis (se não estiver rodando)
redis-server

# 2. Em outro terminal, iniciar a aplicação
npm run start:dev
```

### Opção 2: Com Redis via Docker

Se você não tem Redis instalado localmente, pode usar Docker apenas para Redis:

```bash
# 1. Iniciar apenas Redis via Docker
docker run -d -p 6379:6379 --name redis redis:7-alpine

# 2. Iniciar a aplicação
npm run start:dev

# 3. Para parar Redis quando terminar
docker stop redis && docker rm redis
```

### Modos de execução

```bash
# Modo desenvolvimento (com watch)
npm run start:dev

# Modo debug
npm run start:debug

# Modo produção (build + start)
npm run build
npm run start:prod
```

A API estará disponível em `http://localhost:3000`

## 🐳 Executando com Docker

### Opção 1: Docker Compose do Backend (apenas backend + redis)

Se você está no diretório `backend`:

```bash
# Construir e iniciar containers
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Parar containers
docker-compose down

# Rebuild e restart
docker-compose up -d --build

# Executar migrations dentro do container
docker-compose exec backend npx prisma migrate deploy
```

### Opção 2: Docker Compose da Raiz (backend + frontend + redis)

Se você está na raiz do projeto:

```bash
# Construir e iniciar todos os serviços
docker-compose up -d

# Ver logs do backend
docker-compose logs -f backend

# Parar todos os containers
docker-compose down

# Rebuild e restart
docker-compose up -d --build
```

### Construir imagem manualmente

```bash
# No diretório backend
docker build -t aprove-me-backend .

# Rodar container
docker run -p 3000:3000 \
  -e DATABASE_URL=file:/app/data/dev.db \
  -e REDIS_HOST=redis \
  -e JWT_SECRET=your-secret-key \
  aprove-me-backend
```

### Comandos úteis do Docker

```bash
# Ver logs formatados (com jq)
docker logs aprove-me-backend | jq

# Filtrar logs por nível
docker logs aprove-me-backend | jq 'select(.level == "ERROR")'

# Entrar no container
docker exec -it aprove-me-backend sh

# Verificar saúde do container
docker ps
docker inspect aprove-me-backend | grep Health -A 10

# Limpar volumes e containers
docker-compose down -v
```

## 🔴 Redis (Fila de Processamento)

O projeto utiliza Redis para processamento assíncrono de lotes. 

### Com Docker Compose

O Redis é iniciado automaticamente quando você usa `docker-compose up`.

```bash
# Verificar se Redis está rodando
docker-compose ps redis

# Conectar ao Redis CLI
docker-compose exec redis redis-cli

# Monitorar comandos Redis
docker-compose exec redis redis-cli MONITOR
```

### Sem Docker

Para desenvolvimento local sem Docker, você pode:

1. **Instalar Redis localmente:**
   ```bash
   # macOS
   brew install redis
   brew services start redis
   
   # Ubuntu/Debian
   sudo apt-get install redis-server
   sudo systemctl start redis
   
   # Windows
   # Baixar de: https://github.com/microsoftarchive/redis/releases
   ```

2. **Ou usar um serviço gerenciado** (Redis Cloud, AWS ElastiCache, etc.)

## 📡 Endpoints

### Autenticação (Públicos)

- `POST /integrations/auth` - Autenticar e obter token JWT
- `POST /integrations/users` - Cadastrar novo usuário

### Health Check (Públicos)

- `GET /health` - Health check completo (aplicação + banco de dados)
- `GET /health/liveness` - Liveness probe (apenas aplicação)
- `GET /health/readiness` - Readiness probe (aplicação + dependências)

### Payables (Recebíveis) - Requer Autenticação

- `GET /integrations/payable` - Listar todos os recebíveis
- `POST /integrations/payable` - Criar um recebível
- `GET /integrations/payable/:id` - Buscar recebível por ID
- `PUT /integrations/payable/:id` - Atualizar recebível
- `DELETE /integrations/payable/:id` - Deletar recebível

### Assignors (Cedentes) - Requer Autenticação

- `GET /integrations/assignor` - Listar todos os cedentes
- `POST /integrations/assignor` - Criar um cedente
- `GET /integrations/assignor/:id` - Buscar cedente por ID
- `PUT /integrations/assignor/:id` - Atualizar cedente
- `DELETE /integrations/assignor/:id` - Deletar cedente

### Batch Processing (Lotes) - Requer Autenticação

- `POST /integrations/payable/batch` - Processar pagáveis em lote (até 10.000 itens)

## 📝 Exemplos de Requisição

### Cadastrar Usuário

```bash
POST /integrations/users
Content-Type: application/json

{
  "login": "novousuario",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "id": "uuid-do-usuario",
  "login": "novousuario",
  "createdAt": "2024-01-15T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z"
}
```

### Autenticar (Login)

```bash
POST /integrations/auth
Content-Type: application/json

{
  "login": "aprovame",
  "password": "aprovame"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Criar Assignor (Cedente)

```bash
POST /integrations/assignor
Authorization: Bearer <seu_token>
Content-Type: application/json

{
  "document": "12345678901",
  "email": "cedente@example.com",
  "phone": "11999999999",
  "name": "Nome do Cedente"
}
```

### Criar Payable

```bash
POST /integrations/payable
Authorization: Bearer <seu_token>
Content-Type: application/json

{
  "value": 1000.50,
  "emissionDate": "2024-01-15T00:00:00.000Z",
  "assignor": "660e8400-e29b-41d4-a716-446655440000"
}
```

**Importante:** O campo `assignor` deve ser o UUID de um cedente existente. O cedente deve ser criado previamente através do endpoint `POST /integrations/assignor`.

### Listar Payables

```bash
GET /integrations/payable
Authorization: Bearer <seu_token>
```

### Listar Assignors

```bash
GET /integrations/assignor
Authorization: Bearer <seu_token>
```

### Processar Pagáveis em Lote

```bash
POST /integrations/payable/batch
Authorization: Bearer <seu_token>
Content-Type: application/json

{
  "payables": [
    {
      "value": 1000.50,
      "emissionDate": "2024-01-15T00:00:00.000Z",
      "assignor": "660e8400-e29b-41d4-a716-446655440000"
    },
    {
      "value": 2000.75,
      "emissionDate": "2024-01-16T00:00:00.000Z",
      "assignor": "660e8400-e29b-41d4-a716-446655440000"
    }
    // ... até 10.000 pagáveis
  ]
}
```

**Resposta:**
```json
{
  "batchId": "uuid-do-lote",
  "message": "Lote criado com sucesso. 2 pagáveis foram enfileirados para processamento.",
  "totalPayables": 2
}
```

**Características:**
- ✅ Processamento assíncrono (não bloqueia a requisição)
- ✅ Até 10.000 pagáveis por lote
- ✅ Retry automático até 4 tentativas
- ✅ Dead Letter Queue para itens que falharam após 4 tentativas
- ✅ Email automático ao concluir o processamento do lote
- ✅ Email automático para itens na Fila Morta

## ✅ Validações Implementadas

- ✅ Nenhum campo pode ser nulo
- ✅ IDs devem ser UUID válidos
- ✅ Strings respeitam tamanhos máximos definidos
- ✅ Email deve ser válido
- ✅ Value deve ser um número

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes com watch
npm run test:watch

# Cobertura de testes
npm run test:cov

# Testes e2e
npm run test:e2e

# Debug de testes
npm run test:debug
```

## 📦 Estrutura do Projeto

```
backend/
├── src/
│   ├── core/              # Camada de domínio e aplicação (Clean Architecture)
│   │   ├── domain/        # Entidades e interfaces de domínio
│   │   │   ├── assignor/
│   │   │   ├── payable/
│   │   │   ├── user/
│   │   │   ├── auth/
│   │   │   ├── queue/
│   │   │   └── mail/
│   │   └── application/  # Use cases (lógica de negócio)
│   │       ├── assignor/
│   │       ├── payable/
│   │       ├── user/
│   │       └── batch/
│   ├── infra/             # Camada de infraestrutura
│   │   ├── persistence/   # Repositórios e Prisma
│   │   │   ├── prisma/
│   │   │   └── repositories/
│   │   ├── auth/          # Implementação JWT
│   │   ├── queue/         # Implementação de filas (Bull)
│   │   └── mail/          # Implementação de email (Nodemailer)
│   ├── modules/           # Módulos NestJS (controllers e configuração)
│   │   ├── auth/
│   │   ├── integrations/
│   │   │   ├── payable/
│   │   │   └── assignor/
│   │   ├── batch/
│   │   └── health/
│   ├── shared/            # Utilitários compartilhados
│   │   ├── logger/
│   │   └── interceptors/
│   ├── generated/         # Prisma Client gerado
│   └── main.ts           # Arquivo principal
├── prisma/
│   ├── schema.prisma     # Schema do banco de dados
│   └── seed.ts           # Seed do banco de dados
├── Dockerfile            # Dockerfile para produção
├── docker-compose.yaml   # Docker Compose (backend + redis)
└── package.json
```

## 📊 Sistema de Logs

O projeto utiliza um sistema de logs estruturado com suporte a JSON para produção.

### Configuração

```env
# Em produção, logs são formatados em JSON
LOG_FORMAT=json
LOG_LEVEL=LOG

# Em desenvolvimento, logs são coloridos
LOG_FORMAT=color
LOG_LEVEL=DEBUG
```

### Uso nos serviços

```typescript
import { LoggerService } from '../shared/logger/logger.service';
import { LogLevel } from '../shared/logger/types';

@Injectable()
export class MeuService {
  private readonly logger: LoggerService;

  constructor(private readonly rootLogger: LoggerService) {
    this.logger = rootLogger.createChildLogger('MeuService');
  }

  async fazerAlgo() {
    // Log simples
    this.logger.log('Operação iniciada');

    // Log com metadata
    this.logger.logWithMetadata(LogLevel.DEBUG, 'Processando dados', {
      userId: '123',
      action: 'create',
    });
  }
}
```

### Logs no Docker

```bash
# Ver logs formatados
docker logs aprove-me-backend | jq

# Filtrar por nível
docker logs aprove-me-backend | jq 'select(.level == "ERROR")'

# Seguir logs em tempo real
docker logs -f aprove-me-backend
```

## 🔐 Autenticação

A API utiliza autenticação JWT para proteger todas as rotas, exceto as rotas públicas.

### Cadastro de Usuário

Para criar um novo usuário:

```bash
POST /integrations/users
Content-Type: application/json

{
  "login": "novousuario",
  "password": "senha123"
}
```

**Validações:**
- `login`: obrigatório, string, máximo 140 caracteres, único
- `password`: obrigatório, string

**Resposta:**
```json
{
  "id": "uuid-do-usuario",
  "login": "novousuario",
  "createdAt": "2024-01-15T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z"
}
```

### Endpoint de Login

```bash
POST /integrations/auth
Content-Type: application/json

{
  "login": "aprovame",
  "password": "aprovame"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Usando o Token

Todas as rotas protegidas requerem o token JWT no header:

```bash
Authorization: Bearer <seu_token>
```

**Importante:** O token expira em 1 hora por padrão (configurável via `JWT_EXPIRES_IN`).

### Rotas Públicas

As seguintes rotas são públicas (não requerem autenticação):
- `GET /` - Rota raiz
- `GET /health` - Health check
- `GET /health/liveness` - Liveness probe
- `GET /health/readiness` - Readiness probe
- `POST /integrations/auth` - Login
- `POST /integrations/users` - Cadastro de usuário

### Usuário Padrão

O sistema cria automaticamente um usuário padrão na inicialização:
- **Login:** `aprovame`
- **Password:** `aprovame`

Este usuário é criado automaticamente se não existir no banco de dados.

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev          # Inicia em modo desenvolvimento com watch
npm run start:debug        # Inicia em modo debug

# Produção
npm run build              # Compila o projeto
npm run start:prod         # Inicia em modo produção

# Banco de Dados
npm run prisma:generate    # Gera Prisma Client
npm run prisma:migrate     # Executa migrations
npm run prisma:studio      # Abre Prisma Studio
npm run prisma:seed        # Executa seed do banco

# Qualidade de Código
npm run lint               # Executa ESLint
npm run lint:fix           # Corrige problemas do ESLint
npm run format             # Formata código com Prettier
npm run format:check       # Verifica formatação
npm run lint:format        # Executa lint e format

# Testes
npm run test               # Executa testes unitários
npm run test:watch         # Executa testes em modo watch
npm run test:cov           # Executa testes com cobertura
npm run test:e2e           # Executa testes end-to-end
npm run test:debug         # Executa testes em modo debug
```

## 📚 Níveis Implementados

- ✅ **Nível 1** - Validação de dados
- ✅ **Nível 2** - Persistência com Prisma
- ✅ **Nível 3** - Testes unitários
- ✅ **Nível 4** - Autenticação JWT
- ✅ **Nível 5** - Gerenciamento de permissões
- ✅ **Nível 6** - Docker e Documentação
- ✅ **Nível 7** - Processamento em lotes
- ✅ **Nível 8** - Resiliência (DLQ e Retry)
- ⏳ **Nível 9** - Deploy Cloud
- ⏳ **Nível 10** - Infra as Code

## 🐛 Troubleshooting

### Problema: Redis não conecta

**Solução:**
- Verifique se o Redis está rodando: `docker ps` ou `redis-cli ping`
- Verifique as variáveis `REDIS_HOST` e `REDIS_PORT` no `.env`
- Se usar Docker, verifique se o container está na mesma rede

### Problema: Migrations não executam

**Solução:**
- Execute manualmente: `npx prisma migrate deploy`
- Verifique se o arquivo `dev.db` existe e tem permissões de escrita
- No Docker, execute: `docker-compose exec backend npx prisma migrate deploy`

### Problema: Porta 3000 já está em uso

**Solução:**
- Altere a porta no `.env`: `PORT=3001`
- Ou pare o processo que está usando a porta:
  ```bash
  # Linux/Mac
  lsof -ti:3000 | xargs kill
  
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

### Problema: Token JWT expira muito rápido

**Solução:**
- Ajuste `JWT_EXPIRES_IN` no `.env` (ex: `1h`, `24h`, `7d`)

## 📞 Suporte

Para mais informações ou problemas, consulte a documentação do projeto ou abra uma issue no repositório.
