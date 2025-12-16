import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'


const mockLogin = jest.fn()
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}))


const mockRouterPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}))


jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('LoginForm', () => {
  beforeEach(() => {
    
    jest.clearAllMocks()
  })

  // it('deve renderizar os campos de login e senha', () => {
    
  //   render(<LoginForm />)

    
  //   expect(screen.getByLabelText(/login/i)).toBeInTheDocument()
  //   expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
  //   expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  // })

  // it('deve mostrar erro de validação quando campos estiverem vazios', async () => {
    
  //   const user = userEvent.setup()
  //   render(<LoginForm />)

    
  //   const submitButton = screen.getByRole('button', { name: /entrar/i })
  //   await user.click(submitButton)

    
  //   await waitFor(() => {
  //     expect(screen.getByText(/login é obrigatório/i)).toBeInTheDocument()
  //   })
  // })

  it('deve chamar login quando o formulário for submetido com dados válidos', async () => {
    
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(undefined)
    render(<LoginForm />)

    
    await user.type(screen.getByLabelText(/login/i), 'testuser')
    await user.type(screen.getByLabelText(/senha/i), 'password123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123')
    })
  })

  it('deve mostrar mensagem de erro quando o login falhar', async () => {
    
    const user = userEvent.setup()
    const errorMessage = 'Credenciais inválidas'
    mockLogin.mockRejectedValue({ message: errorMessage })
    const toast = require('sonner').toast
    
    render(<LoginForm />)

    
    await user.type(screen.getByLabelText(/login/i), 'wronguser')
    await user.type(screen.getByLabelText(/senha/i), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage)
    })
  })

  // it('deve desabilitar o botão durante o envio', async () => {
    
  //   const user = userEvent.setup()
  //   let resolveLogin: () => void
  //   mockLogin.mockImplementation(
  //     () =>
  //       new Promise((resolve) => {
  //         resolveLogin = resolve as () => void
  //       })
  //   )
  //   render(<LoginForm />)

    
  //   await user.type(screen.getByLabelText(/login/i), 'testuser')
  //   await user.type(screen.getByLabelText(/senha/i), 'password123')
  //   await user.click(screen.getByRole('button', { name: /entrar/i }))

    
  //   await waitFor(() => {
  //     expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled()
  //   })

  //   resolveLogin!()
  // })
})
