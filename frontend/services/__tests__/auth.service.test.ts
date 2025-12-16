import { authService } from '../auth.service'
import { apiRequest } from '@/lib/api'


jest.mock('@/lib/api')

describe('authService', () => {
  beforeEach(() => {
    
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('login', () => {
    it('deve salvar o token no localStorage quando o login for bem-sucedido', async () => {
      
      const mockToken = 'mock-jwt-token'
      const mockResponse = { access_token: mockToken }
      const credentials = { login: 'testuser', password: 'password123' }
      
      ;(apiRequest as jest.Mock).mockResolvedValue(mockResponse)

      
      const result = await authService.login(credentials)

      
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', mockToken)
      expect(result).toEqual(mockResponse)
      expect(apiRequest).toHaveBeenCalledWith('/integrations/auth', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })
    })

    it('deve lançar erro quando o login falhar', async () => {
      
      const credentials = { login: 'testuser', password: 'wrongpassword' }
      const mockError = {
        message: 'Credenciais inválidas',
        statusCode: 401,
      }
      
      ;(apiRequest as jest.Mock).mockRejectedValue(mockError)

      
      await expect(authService.login(credentials)).rejects.toEqual({
        message: 'Credenciais inválidas',
        statusCode: 401,
      })
      expect(localStorage.setItem).not.toHaveBeenCalled()
    })
  })

  describe('logout', () => {
    it('deve remover o token do localStorage', () => {
      
      localStorage.setItem('auth_token', 'mock-token')

      
      authService.logout()

      
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token')
    })
  })

  describe('getToken', () => {
    it('deve retornar o token do localStorage quando existir', () => {
      
      const mockToken = 'mock-jwt-token'
      ;(localStorage.getItem as jest.Mock).mockReturnValue(mockToken)

      
      const result = authService.getToken()

      
      expect(result).toBe(mockToken)
      expect(localStorage.getItem).toHaveBeenCalledWith('auth_token')
    })

    it('deve retornar null quando não houver token', () => {
      
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)

      
      const result = authService.getToken()

      
      expect(result).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('deve retornar false quando não houver token', () => {
      
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)

      
      const result = authService.isAuthenticated()

      
      expect(result).toBe(false)
    })

    it('deve retornar true quando o token for válido e não expirado', () => {
      
      const futureExp = Math.floor(Date.now() / 1000) + 3600 
      const payload = { exp: futureExp }
      const token = `header.${btoa(JSON.stringify(payload))}.signature`
      ;(localStorage.getItem as jest.Mock).mockReturnValue(token)

      
      const result = authService.isAuthenticated()

      
      expect(result).toBe(true)
    })

    it('deve retornar false quando o token estiver expirado', () => {
      
      const pastExp = Math.floor(Date.now() / 1000) - 3600 
      const payload = { exp: pastExp }
      const token = `header.${btoa(JSON.stringify(payload))}.signature`
      ;(localStorage.getItem as jest.Mock).mockReturnValue(token)

      
      const result = authService.isAuthenticated()

      
      expect(result).toBe(false)
    })

    it('deve retornar false quando o token for inválido', () => {
      
      const invalidToken = 'invalid-token'
      ;(localStorage.getItem as jest.Mock).mockReturnValue(invalidToken)

      
      const result = authService.isAuthenticated()

      
      expect(result).toBe(false)
    })
  })

  describe('register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      
      const mockResponse = {
        id: '123',
        login: 'newuser',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
      const credentials = { login: 'newuser', password: 'password123' }
      
      ;(apiRequest as jest.Mock).mockResolvedValue(mockResponse)

      
      const result = await authService.register(credentials)

      
      expect(result).toEqual(mockResponse)
      expect(apiRequest).toHaveBeenCalledWith('/integrations/users', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })
    })

    it('deve lançar erro quando o registro falhar', async () => {
      
      const credentials = { login: 'existinguser', password: 'password123' }
      const mockError = {
        message: 'Usuário já existe',
        statusCode: 409,
      }
      
      ;(apiRequest as jest.Mock).mockRejectedValue(mockError)

      
      await expect(authService.register(credentials)).rejects.toEqual({
        message: 'Usuário já existe',
        statusCode: 409,
      })
    })
  })
})
