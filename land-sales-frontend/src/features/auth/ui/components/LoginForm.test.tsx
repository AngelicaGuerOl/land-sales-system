import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../../../shared/api/apiError'
import { renderWithProviders } from '../../../../test/render'
import { AuthContext, type AuthContextValue } from '../hooks/AuthContext'
import { LoginForm } from './LoginForm'

function renderLoginForm(authOverrides: Partial<AuthContextValue> = {}) {
  const authValue: AuthContextValue = {
    user: null,
    isLoadingUser: false,
    login: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn(),
    ...authOverrides,
  }

  function AuthWrapper({ children }: { children: ReactNode }) {
    return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  }

  const result = renderWithProviders(
    <AuthWrapper>
      <LoginForm />
    </AuthWrapper>,
  )

  return { ...result, authValue }
}

describe('LoginForm', () => {
  it('renders the login fields and submit button', () => {
    renderLoginForm()

    expect(screen.getByLabelText('Usuario')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('shows validation messages when submitting empty credentials', async () => {
    const user = userEvent.setup()
    const login = vi.fn().mockResolvedValue(undefined)

    renderLoginForm({ login })

    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Ingresa el usuario')).toBeInTheDocument()
    expect(screen.getByText('Ingresa la contraseña')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('submits the entered credentials through auth login', async () => {
    const user = userEvent.setup()
    const login = vi.fn().mockResolvedValue(undefined)

    renderLoginForm({ login })

    await user.type(screen.getByLabelText('Usuario'), 'admin')
    await user.type(screen.getByLabelText('Contraseña'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        username: 'admin',
        password: 'secret',
      })
    })
  })

  it('disables the submit button while login is pending', async () => {
    const user = userEvent.setup()
    let finishLogin: (() => void) | undefined
    const login = vi.fn(() => new Promise<void>((resolve) => {
      finishLogin = resolve
    }))

    renderLoginForm({ login })

    await user.type(screen.getByLabelText('Usuario'), 'admin')
    await user.type(screen.getByLabelText('Contraseña'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled()

    finishLogin?.()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled()
    })
  })

  it('shows the application authentication error for invalid credentials', async () => {
    const user = userEvent.setup()
    const login = vi.fn().mockRejectedValue(new ApiError(401, 'Unauthorized'))

    renderLoginForm({ login })

    await user.type(screen.getByLabelText('Usuario'), 'admin')
    await user.type(screen.getByLabelText('Contraseña'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Usuario o contraseña inválidos')).toBeInTheDocument()
  })
})
