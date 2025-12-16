# Frontend - Aprove-me

Interface web desenvolvida com Next.js para gerenciamento de recebíveis (payables) e cedentes (assignors).

## 🚀 Tecnologias

- **Next.js 16** - Framework React com App Router
- **TypeScript** - Linguagem de programação
- **Tailwind CSS 4** - Framework CSS utilitário
- **React 19** - Biblioteca JavaScript
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Jest** - Framework de testes
- **Testing Library** - Testes de componentes React

## 📋 Pré-requisitos

### Para desenvolvimento local:
- Node.js (v18 ou superior)
- npm ou yarn

### Para Docker:
- Docker (v20 ou superior)
- Docker Compose (v2 ou superior)

## 🔧 Instalação

```bash
cd frontend

# Instalar dependências
npm install
```

## 📝 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto frontend:

```env
# URL da API Backend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Importante:** 
- A variável `NEXT_PUBLIC_API_URL` é usada durante o build e no servidor
- No cliente (browser), o frontend usa um proxy Next.js (`/api`) para evitar problemas de CORS
- O proxy redireciona para o backend configurado em `NEXT_PUBLIC_API_URL`

## 🏃 Executando Localmente

### Modo Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3001`

**Nota:** O frontend roda na porta `3001` por padrão para não conflitar com o backend que roda na porta `3000`.

### Modo Produção

```bash
# Criar build de produção
npm run build

# Iniciar servidor de produção
npm run start
```

## 🐳 Executando com Docker

### Opção 1: Docker Compose da Raiz (Backend + Frontend + Redis)

Se você está na raiz do projeto:

```bash
# Construir e iniciar todos os serviços
docker-compose up -d

# Ver logs do frontend
docker-compose logs -f frontend

# Parar todos os containers
docker-compose down

# Rebuild e restart apenas o frontend
docker-compose up -d --build frontend
```

### Opção 2: Construir e Rodar Manualmente

```bash
cd frontend

# Construir a imagem
docker build -t aprove-me-frontend --build-arg NEXT_PUBLIC_API_URL=http://localhost:3000 .

# Rodar container
docker run -p 3001:3001 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3000 \
  aprove-me-frontend
```

### Variáveis de Ambiente no Docker

O Dockerfile aceita o build argument `NEXT_PUBLIC_API_URL`:

```bash
docker build --build-arg NEXT_PUBLIC_API_URL=http://backend:3000 -t aprove-me-frontend .
```

**Importante:** No Docker Compose da raiz, o frontend se comunica com o backend através da rede Docker usando `http://backend:3000`.

## 📦 Estrutura do Projeto

```
frontend/
├── app/                          # App Router do Next.js
│   ├── api/                      # API Routes (proxy para backend)
│   │   └── [...path]/
│   │       └── route.ts         # Proxy route handler
│   ├── assignors/                # Páginas de cedentes
│   │   ├── [id]/
│   │   │   └── page.tsx         # Detalhes do cedente
│   │   └── new/
│   │       └── page.tsx         # Criar novo cedente
│   ├── dashboard/
│   │   └── page.tsx             # Dashboard
│   ├── login/
│   │   └── page.tsx             # Página de login
│   ├── payables/                 # Páginas de recebíveis
│   │   ├── [id]/
│   │   │   ├── page.tsx         # Detalhes do recebível
│   │   │   └── edit/
│   │   │       └── page.tsx     # Editar recebível
│   │   ├── new/
│   │   │   └── page.tsx         # Criar novo recebível
│   │   └── page.tsx             # Listagem de recebíveis
│   ├── register/
│   │   └── page.tsx             # Página de cadastro
│   ├── layout.tsx               # Layout raiz
│   ├── page.tsx                 # Página inicial
│   └── globals.css              # Estilos globais
├── components/                    # Componentes React
│   ├── forms/                    # Formulários
│   │   ├── AssignorForm.tsx
│   │   ├── LoginForm.tsx
│   │   ├── PayableForm.tsx
│   │   ├── PayableEditForm.tsx
│   │   └── RegisterForm.tsx
│   ├── ui/                       # Componentes UI (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── select.tsx
│   ├── AppLayout.tsx            # Layout da aplicação
│   ├── ClientLayout.tsx         # Layout do cliente
│   ├── Navbar.tsx               # Barra de navegação
│   ├── ProtectedRoute.tsx       # Rota protegida
│   └── DeleteConfirmDialog.tsx  # Dialog de confirmação
├── contexts/                      # Contextos React
│   └── AuthContext.tsx          # Contexto de autenticação
├── lib/                          # Utilitários e helpers
│   ├── api.ts                    # Cliente API (com proxy)
│   ├── utils.ts                  # Funções utilitárias
│   └── validations.ts            # Schemas Zod
├── services/                      # Serviços de API
│   ├── auth.service.ts           # Serviço de autenticação
│   ├── assignor.service.ts       # Serviço de cedentes
│   └── payable.service.ts        # Serviço de recebíveis
├── public/                        # Arquivos estáticos
│   └── logo-bankme.png          # Logo da aplicação
├── Dockerfile                    # Configuração Docker
├── next.config.ts                # Configuração Next.js
├── jest.config.js                # Configuração Jest
├── jest.setup.js                 # Setup dos testes
├── tsconfig.json                 # Configuração TypeScript
└── package.json
```

## 🎯 Funcionalidades Implementadas

### ✅ Nível 1 - Cadastro
- [x] Interface para cadastrar pagáveis
- [x] Validação de campos com Zod
- [x] Tela de exibição do pagável cadastrado
- [x] Interface para cadastrar cedentes

### ✅ Nível 2 - Conectando na API
- [x] Integração com API backend
- [x] Tela de cadastro de cedente
- [x] Campo `assignor` como combobox (select)
- [x] Proxy Next.js para evitar CORS

### ✅ Nível 3 - Listando
- [x] Listagem de pagáveis (id, value, emissionDate)
- [x] Listagem de cedentes
- [x] Página de detalhes do pagável
- [x] Página de detalhes do cedente
- [x] Opções de editar e excluir
- [x] Link para dados do cedente

### ✅ Nível 4 - Autenticação
- [x] Tela de login
- [x] Tela de cadastro de usuário
- [x] Armazenamento de token no localStorage
- [x] Verificação de expiração do token JWT
- [x] Redirecionamento automático quando token expirar
- [x] Proteção de rotas (ProtectedRoute)
- [x] Context API para gerenciamento de autenticação
- [x] Logout automático em caso de erro 401

### ✅ Nível 5 - Testes
- [x] Testes unitários com Jest
- [x] Testes de componentes com Testing Library
- [x] Testes de serviços
- [x] Testes de contexto de autenticação

## 🔗 Integração com Backend

O frontend se comunica com o backend através de um proxy Next.js que evita problemas de CORS.

### Proxy Next.js

O frontend usa uma API Route (`app/api/[...path]/route.ts`) que funciona como proxy, redirecionando requisições do cliente para o backend.

**Como funciona:**
- Cliente faz requisição para `/api/integrations/payable`
- Next.js proxy redireciona para `NEXT_PUBLIC_API_URL/integrations/payable`
- Token JWT é automaticamente incluído no header `Authorization`

### Endpoints Utilizados

**Autenticação:**
- `POST /integrations/auth` - Login
- `POST /integrations/users` - Cadastro de usuário

**Payables (Recebíveis):**
- `GET /integrations/payable` - Listar recebíveis
- `POST /integrations/payable` - Criar recebível
- `GET /integrations/payable/:id` - Buscar recebível por ID
- `PUT /integrations/payable/:id` - Atualizar recebível
- `DELETE /integrations/payable/:id` - Deletar recebível

**Assignors (Cedentes):**
- `GET /integrations/assignor` - Listar cedentes
- `POST /integrations/assignor` - Criar cedente
- `GET /integrations/assignor/:id` - Buscar cedente por ID
- `PUT /integrations/assignor/:id` - Atualizar cedente
- `DELETE /integrations/assignor/:id` - Deletar cedente

## 🔐 Autenticação

### Fluxo de Autenticação

1. **Login:** Usuário faz login em `/login`
2. **Token:** Token JWT é armazenado no `localStorage` como `auth_token`
3. **Verificação:** Token é verificado a cada requisição e a cada 30 segundos
4. **Expiração:** Se o token expirar, usuário é redirecionado para `/login`
5. **Logout:** Token é removido do `localStorage` e usuário é redirecionado

### Rotas Protegidas

As seguintes rotas requerem autenticação:
- `/dashboard` - Dashboard
- `/payables` - Listagem de recebíveis
- `/payables/new` - Criar recebível
- `/payables/:id` - Detalhes do recebível
- `/payables/:id/edit` - Editar recebível
- `/assignors` - Listagem de cedentes
- `/assignors/new` - Criar cedente
- `/assignors/:id` - Detalhes do cedente

### Rotas Públicas

As seguintes rotas são públicas:
- `/` - Página inicial
- `/login` - Login
- `/register` - Cadastro de usuário

## 📚 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento na porta 3001

# Produção
npm run build            # Cria build de produção
npm run start            # Inicia servidor de produção na porta 3001

# Qualidade de Código
npm run lint             # Executa ESLint

# Testes
npm run test             # Executa testes unitários
npm run test:watch       # Executa testes em modo watch
npm run test:coverage    # Executa testes com cobertura
```

## 🧪 Testes

O projeto utiliza Jest e Testing Library para testes.

### Executando Testes

```bash
# Executar todos os testes
npm run test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage
```

### Estrutura de Testes

```
frontend/
├── components/
│   └── forms/
│       └── __tests__/
│           └── LoginForm.test.tsx
├── contexts/
│   └── __tests__/
│       └── AuthContext.test.tsx
├── lib/
│   └── __tests__/
│       └── api.test.ts
└── services/
    └── __tests__/
        └── auth.service.test.ts
```

### Configuração de Testes

- **Jest:** Configurado em `jest.config.js`
- **Setup:** Configuração adicional em `jest.setup.js`
- **Environment:** `jsdom` para simular ambiente de browser

## 🎨 UI/UX

### Componentes UI

O projeto utiliza componentes baseados em shadcn/ui:
- Button
- Card
- Input
- Label
- Select

### Estilização

- **Tailwind CSS 4** para estilização utilitária
- **Design System** consistente com cores e espaçamentos
- **Responsive Design** para diferentes tamanhos de tela

## 🐛 Troubleshooting

### Problema: CORS errors

**Solução:**
- Verifique se o proxy Next.js está funcionando (`app/api/[...path]/route.ts`)
- Verifique se `NEXT_PUBLIC_API_URL` está configurado corretamente
- No desenvolvimento, certifique-se de que o backend está rodando

### Problema: Token não persiste após refresh

**Solução:**
- O token é armazenado no `localStorage`, que persiste entre sessões
- Verifique se não há bloqueadores de cookies/localStorage no navegador
- Verifique se o token não expirou (tokens JWT têm tempo de expiração)

### Problema: Redirecionamento infinito para login

**Solução:**
- Verifique se o token está sendo salvo corretamente após login
- Verifique se a verificação de autenticação não está causando loop
- Limpe o `localStorage` e tente fazer login novamente

### Problema: Porta 3001 já está em uso

**Solução:**
- Altere a porta no script `dev` do `package.json`
- Ou pare o processo que está usando a porta:
  ```bash
  # Linux/Mac
  lsof -ti:3001 | xargs kill
  
  # Windows
  netstat -ano | findstr :3001
  taskkill /PID <PID> /F
  ```

## 📱 Páginas Disponíveis

- **/** - Página inicial com link para login
- **/login** - Tela de login
- **/register** - Tela de cadastro de usuário
- **/dashboard** - Dashboard (protegida)
- **/payables** - Listagem de recebíveis (protegida)
- **/payables/new** - Criar novo recebível (protegida)
- **/payables/:id** - Detalhes do recebível (protegida)
- **/payables/:id/edit** - Editar recebível (protegida)
- **/assignors** - Listagem de cedentes (protegida)
- **/assignors/new** - Criar novo cedente (protegida)
- **/assignors/:id** - Detalhes do cedente (protegida)

## 🔄 Fluxo de Dados

1. **Usuário interage** com componente React
2. **Formulário valida** dados usando Zod
3. **Serviço** faz requisição através de `apiRequest`
4. **Proxy Next.js** redireciona para backend
5. **Backend processa** e retorna resposta
6. **Frontend atualiza** estado e UI

## 📚 Bibliotecas Principais

- **Next.js 16** - Framework React com SSR/SSG
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas TypeScript-first
- **Tailwind CSS** - Framework CSS utilitário
- **Sonner** - Biblioteca de notificações (toast)
- **Lucide React** - Ícones

## 🚀 Deploy

### Build de Produção

```bash
# Criar build otimizado
npm run build

# O build será gerado em .next/
```

### Variáveis de Ambiente em Produção

Certifique-se de configurar:
- `NEXT_PUBLIC_API_URL` - URL do backend em produção

### Docker em Produção

```bash
# Build com variável de ambiente
docker build --build-arg NEXT_PUBLIC_API_URL=https://api.exemplo.com -t aprove-me-frontend .

# Rodar container
docker run -p 3001:3001 aprove-me-frontend
```

## 📞 Suporte

Para mais informações ou problemas, consulte a documentação do projeto ou abra uma issue no repositório.
