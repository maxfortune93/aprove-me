import { apiRequest } from '../api'


global.fetch = jest.fn()

describe('apiRequest', () => {
  beforeEach(() => {
    
    jest.clearAllMocks()
    localStorage.clear()
    window.location.href = ''
    
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('deve fazer requisição GET com sucesso', async () => {
    
    const mockData = { id: '1', name: 'Test' }
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => mockData,
    })

    
    const result = await apiRequest('/test')

    
    expect(result).toEqual(mockData)
    expect(fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    )
  })

  it('deve adicionar token de autorização quando existir no localStorage', async () => {
    
    const mockToken = 'bearer-token'
    localStorage.setItem('auth_token', mockToken)
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({}),
    })

    
    await apiRequest('/test')

    
    expect(fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockToken}`,
        }),
      })
    )
  })

  it('deve remover token e redirecionar quando receber 401', async () => {
    
    const mockToken = 'expired-token'
    localStorage.setItem('auth_token', mockToken)
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ message: 'Token expirado' }),
    })

    
    await expect(apiRequest('/test')).rejects.toEqual({
      message: 'Token expirado',
      statusCode: 401,
    })

    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token')
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'auth:logout' })
    )
    expect(window.location.href).toBe('/login')
  })

  it('deve lançar erro quando a requisição falhar', async () => {
    
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ message: 'Erro interno do servidor' }),
    })

    
    await expect(apiRequest('/test')).rejects.toEqual({
      message: 'Erro interno do servidor',
      statusCode: 500,
    })
  })

  it('deve normalizar endpoint que não começa com /', async () => {
    
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({}),
    })

    
    await apiRequest('test')

    
    expect(fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.any(Object)
    )
  })
})
