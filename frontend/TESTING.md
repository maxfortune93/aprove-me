# Guia de Testes

Este projeto utiliza Jest e React Testing Library para testes unitários seguindo o padrão **AAA (Arrange-Act-Assert)**.

## Instalação

Instale as dependências de desenvolvimento:

```bash
npm install
```

## Executando os Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch (re-executa quando arquivos mudam)
npm run test:watch

# Executar testes com cobertura
npm run test:coverage
```

## Estrutura dos Testes

Todos os testes seguem o padrão **AAA**:

- **Arrange**: Preparação do ambiente de teste (mocks, dados, configurações)
- **Act**: Execução da ação que está sendo testada
- **Assert**: Verificação dos resultados esperados

### Exemplo:

```typescript
it('deve salvar o token no localStorage quando o login for bem-sucedido', async () => {
  // Arrange
  const mockToken = 'mock-jwt-token'
  const mockResponse = { access_token: mockToken }
  const credentials = { login: 'testuser', password: 'password123' }
  
  ;(apiRequest as jest.Mock).mockResolvedValue(mockResponse)

  // Act
  const result = await authService.login(credentials)

  // Assert
  expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', mockToken)
  expect(result).toEqual(mockResponse)
})
```

## Arquivos de Teste

Os testes estão organizados em pastas `__tests__` próximas aos arquivos testados:

- `services/__tests__/auth.service.test.ts` - Testes do serviço de autenticação
- `lib/__tests__/api.test.ts` - Testes da função de requisição API
- `components/forms/__tests__/LoginForm.test.tsx` - Testes do formulário de login
- `contexts/__tests__/AuthContext.test.tsx` - Testes do contexto de autenticação

## Cobertura

O projeto está configurado para coletar cobertura de:
- `services/**/*.{ts,tsx}`
- `lib/**/*.{ts,tsx}`
- `components/**/*.{ts,tsx}`
- `contexts/**/*.{ts,tsx}`

Execute `npm run test:coverage` para ver o relatório de cobertura.
