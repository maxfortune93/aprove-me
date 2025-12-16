
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { authService } from '@/services/auth.service'


jest.mock('@/services/auth.service')


const mockRouterPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockRouterPush,
  })),
}))

describe('AuthContext', () => {
  beforeEach(() => {

    jest.clearAllMocks()
    localStorage.clear()

    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/dashboard',
        href: '',
      },
      writable: true,
    })

    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('deve inicializar com isAuthenticated false quando não houver token', async () => {

    ;(authService.isAuthenticated as jest.Mock).mockReturnValue(false)

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('deve inicializar com isAuthenticated true quando houver token válido', async () => {

    ;(authService.isAuthenticated as jest.Mock).mockReturnValue(true)

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('deve fazer login e atualizar estado quando login for bem-sucedido', async () => {

    ;(authService.isAuthenticated as jest.Mock)
      .mockReturnValueOnce(false) 
      .mockReturnValue(true)
    ;(authService.login as jest.Mock).mockResolvedValue({ access_token: 'token' })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.login('testuser', 'password123')
    })

    expect(authService.login).toHaveBeenCalledWith({ login: 'testuser', password: 'password123' })
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('deve fazer logout e redirecionar para login', async () => {

    let isLoggedOut = false
    ;(authService.isAuthenticated as jest.Mock).mockImplementation(() => {
      return !isLoggedOut
    })
    ;(authService.logout as jest.Mock).mockImplementation(() => {
      isLoggedOut = true
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })

    act(() => {
      result.current.logout()
    })

    expect(authService.logout).toHaveBeenCalled()
    expect(result.current.isAuthenticated).toBe(false)
    expect(mockRouterPush).toHaveBeenCalledWith('/login')
    
    act(() => {
      jest.advanceTimersByTime(30000)
    })
    
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('deve escutar evento auth:logout e atualizar estado', async () => {
    let isLoggedOut = false
    ;(authService.isAuthenticated as jest.Mock).mockImplementation(() => {
      return !isLoggedOut
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })

    act(() => {
      isLoggedOut = true
      const event = new CustomEvent('auth:logout')
      window.dispatchEvent(event)
    })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false)
    })
    expect(mockRouterPush).toHaveBeenCalledWith('/login')
    
    act(() => {
      jest.advanceTimersByTime(30000)
    })
    
    expect(result.current.isAuthenticated).toBe(false)
  })
})