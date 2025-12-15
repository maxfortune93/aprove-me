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

- Node.js (v18 ou superior)
- npm ou yarn

## 🔧 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
```

## 📝 Variáveis de Ambiente

```env
# Database
DATABASE_URL="file:./dev.db"

# Server
PORT=3000
NODE_ENV=development

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
```

## 🗄️ Banco de Dados

```bash
# Gerar Prisma Client
npx prisma generate

# Criar/atualizar banco de dados
npx prisma migrate dev

# Visualizar banco de dados (opcional)
npx prisma studio
```

## 🔴 Redis (Fila de Processamento)

O projeto utiliza Redis para processamento assíncrono de lotes. Com Docker Compose, o Redis é iniciado automaticamente.

```bash
# Verificar se Redis está rodando
docker-compose ps redis

# Conectar ao Redis CLI (opcional)
docker-compose exec redis redis-cli
```

**Nota:** Para desenvolvimento local sem Docker, você pode instalar Redis localmente ou usar um serviço gerenciado.

## 🏃 Executando o projeto

```bash
# Modo desenvolvimento (com watch)
npm run start:dev

# Modo produção
npm run build
npm run start:prod
```

A API estará disponível em `http://localhost:3000`

## 📡 Endpoints

### Autenticação (Públicos)

- `POST /integrations/auth` - Autenticar e obter token JWT
- `POST /integrations/users` - Cadastrar novo usuário

### Health Check (Públicos)

- `GET /health` - Health check completo (aplicação + banco de dados)
- `GET /health/liveness` - Liveness probe (apenas aplicação)
- `GET /health/readiness` - Readiness probe (aplicação + dependências)

### Payables (Recebíveis) - Requer Autenticação

- `POST /integrations/payable` - Criar um recebível
- `GET /integrations/payable/:id` - Buscar recebível por ID
- `PUT /integrations/payable/:id` - Atualizar recebível
- `DELETE /integrations/payable/:id` - Deletar recebível

### Assignors (Cedentes) - Requer Autenticação

- `POST /integrations/assignor` - Criar um cedente
- `GET /integrations/assignor/:id` - Buscar cedente por ID
- `PUT /integrations/assignor/:id` - Atualizar cedente
- `DELETE /integrations/assignor/:id` - Deletar cedente

### Batch Processing (Lotes) - Requer Autenticação

- `POST /integrations/payable/batch` - Processar pagáveis em lote (até 10.000 itens)

## 📝 Exemplo de Requisição

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

### Criar Payable

```bash
POST /integrations/payable
Authorization: Bearer <seu_token>
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "value": 1000.50,
  "emissionDate": "2024-01-15T00:00:00.000Z",
  "assignor": "660e8400-e29b-41d4-a716-446655440000"
}
```

**Importante:** O campo `assignor` deve ser o UUID de um cedente existente. O cedente deve ser criado previamente através do endpoint `POST /integrations/assignor`.

### Processar Pagáveis em Lote

```bash
POST /integrations/payable/batch
Authorization: Bearer <seu_token>
Content-Type: application/json

{
  "payables": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "value": 1000.50,
      "emissionDate": "2024-01-15T00:00:00.000Z",
      "assignor": "660e8400-e29b-41d4-a716-446655440000"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
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
│   │   └── logger/
│   ├── generated/         # Prisma Client gerado
│   └── main.ts           # Arquivo principal
├── prisma/
│   └── schema.prisma     # Schema do banco de dados
└── package.json
```

## 📊 Sistema de Logs

O projeto utiliza um sistema de logs estruturado com suporte a JSON para produção.

### Configuração

```typescript
// Em produção, logs são formatados em JSON
LOG_FORMAT=json
LOG_LEVEL=LOG

// Em desenvolvimento, logs são coloridos
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
docker logs container-name | jq

# Filtrar por nível
docker logs container-name | jq 'select(.level == "ERROR")'
```

## 🐳 Docker

### Construir a imagem

```bash
docker build -t aprove-me-backend .
```

### Rodar com Docker

```bash
# Produção
docker-compose up -d

# Desenvolvimento
docker-compose -f docker-compose.dev.yaml up
```

### Comandos úteis

```bash
# Ver logs
docker-compose logs -f backend

# Parar containers
docker-compose down

# Rebuild e restart
docker-compose up -d --build

# Executar migrations dentro do container
docker-compose exec backend npx prisma migrate deploy
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

**Importante:** O token expira em 1 minuto (conforme especificação).

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

## 📚 Níveis Implementados

- ✅ **Nível 1** - Validação de dados
- ✅ **Nível 2** - Persistência com Prisma
- ⏳ **Nível 3** - Testes unitários
- ✅ **Nível 4** - Autenticação JWT
- ✅ **Nível 5** - Gerenciamento de permissões
- ✅ **Nível 6** - Docker e Documentação
- ✅ **Nível 7** - Processamento em lotes
- ✅ **Nível 8** - Resiliência (DLQ e Retry)
- ⏳ **Nível 9** - Deploy Cloud
- ⏳ **Nível 10** - Infra as Code
