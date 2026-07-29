import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../../../shared/api/apiError'
import { renderWithProviders } from '../../../../test/render'
import { AuthContext, type AuthContextValue } from '../hooks/AuthContext'
import { LoginForm } from './LoginForm'

function renderLoginForm(authOverrides: Partial<AuthContextValue> = {}) {
  const authValue: AuthContextValue = {
    user: null,
    hasSession: false,
    isAuthenticated: false,
    isLoadingUser: false,
    login: vi.fn().mockResolvedValue(undefined),
    loginDemo: vi.fn().mockResolvedValue(undefined),
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

afterEach(() => {
  vi.useRealTimers()
})

describe('LoginForm', () => {
  it('renders the login fields and submit button', () => {
    renderLoginForm()

    expect(screen.getByText('Land Sales')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Bienvenido' })).toBeInTheDocument()
    expect(screen.getByText('Inicia sesión para administrar lotes, clientes, ventas y pagos.')).toBeInTheDocument()
    expect(screen.getByLabelText('Usuario')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Explorar la demo' })).toBeInTheDocument()
    expect(screen.getByText('El primer acceso puede tardar unos segundos.')).toBeInTheDocument()
  })

  it('shows validation messages when submitting empty credentials', async () => {
    const user = userEvent.setup()
    const login = vi.fn().mockResolvedValue(undefined)

    renderLoginForm({ login })

    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

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
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

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
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(screen.getByRole('button', { name: 'Iniciando sesión...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Explorar la demo' })).toBeDisabled()
    expect(screen.getByLabelText('Usuario')).toBeDisabled()
    expect(screen.getByLabelText('Contraseña')).toBeDisabled()

    finishLogin?.()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled()
    })
  })

  it('shows the application authentication error for invalid credentials', async () => {
    const user = userEvent.setup()
    const login = vi.fn().mockRejectedValue(new ApiError(401, 'Unauthorized'))

    renderLoginForm({ login })

    await user.type(screen.getByLabelText('Usuario'), 'admin')
    await user.type(screen.getByLabelText('Contraseña'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByText('Usuario o contraseña inválidos')).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()

    renderLoginForm()

    const password = screen.getByLabelText('Contraseña')
    expect(password).toHaveAttribute('type', 'password')

    await user.click(screen.getByLabelText('Mostrar contraseña'))

    expect(password).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText('Ocultar contraseña')).toBeInTheDocument()
  })

  it('submits the demo login through auth loginDemo', async () => {
    const user = userEvent.setup()
    const loginDemo = vi.fn().mockResolvedValue(undefined)

    renderLoginForm({ loginDemo })

    await user.click(screen.getByRole('button', { name: 'Explorar la demo' }))

    await waitFor(() => {
      expect(loginDemo).toHaveBeenCalledTimes(1)
    })
  })

  it('shows demo loading state and prevents duplicate demo requests', async () => {
    const user = userEvent.setup()
    let finishDemoLogin: (() => void) | undefined
    const loginDemo = vi.fn(() => new Promise<void>((resolve) => {
      finishDemoLogin = resolve
    }))

    renderLoginForm({ loginDemo })

    await user.dblClick(screen.getByRole('button', { name: 'Explorar la demo' }))

    expect(screen.getByRole('button', { name: 'Preparando la demo...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeDisabled()
    expect(loginDemo).toHaveBeenCalledTimes(1)

    finishDemoLogin?.()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Explorar la demo' })).toBeEnabled()
    })
  })

  it('shows a cold start message when authentication takes several seconds', async () => {
    vi.useFakeTimers()
    let finishDemoLogin: (() => void) | undefined
    const loginDemo = vi.fn(() => new Promise<void>((resolve) => {
      finishDemoLogin = resolve
    }))

    renderLoginForm({ loginDemo })

    fireEvent.click(screen.getByRole('button', { name: 'Explorar la demo' }))
    await vi.advanceTimersByTimeAsync(8_000)

    expect(screen.getByText('El servidor de demostración está iniciando. Esto puede tardar unos segundos.'))
      .toBeInTheDocument()

    finishDemoLogin?.()
    await vi.runOnlyPendingTimersAsync()
    vi.useRealTimers()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Explorar la demo' })).toBeEnabled()
    })
  })

  it('shows a friendly demo error when demo authentication fails', async () => {
    const user = userEvent.setup()
    const loginDemo = vi.fn().mockRejectedValue(new ApiError(404, 'Not Found'))

    renderLoginForm({ loginDemo })

    await user.click(screen.getByRole('button', { name: 'Explorar la demo' }))

    expect(await screen.findByText('No fue posible preparar la demo. Intenta nuevamente en unos segundos.')).toBeInTheDocument()
  })

  it('shows a timeout error and re-enables actions when authentication exceeds the limit', async () => {
    const user = userEvent.setup()
    const loginDemo = vi.fn().mockRejectedValue(new ApiError(0, 'Request timed out'))

    renderLoginForm({ loginDemo })

    await user.click(screen.getByRole('button', { name: 'Explorar la demo' }))

    expect(await screen.findByText('El servidor tardó más de lo esperado. Intenta nuevamente.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Explorar la demo' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled()
  })
})
