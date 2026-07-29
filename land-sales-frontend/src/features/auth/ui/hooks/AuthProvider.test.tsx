import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { routePaths } from '../../../../shared/routes/routePaths'
import { ProtectedRoute } from '../../../../shared/routes/ProtectedRoute'
import { tokenStorage } from '../../../../shared/lib/storage/tokenStorage'
import { renderWithProviders } from '../../../../test/render'
import { server } from '../../../../test/server'
import { authDependencies } from '../../dependencies'
import type { AuthSession, User } from '../../domain/entities/User'
import { useAuth } from './useAuth'
import { AuthProvider } from './AuthProvider'

const demoUser: User = {
  id: 1,
  username: 'demo',
  fullName: 'Demo User',
}

const demoSession: AuthSession = {
  tokenType: 'Bearer',
  accessToken: 'demo-token',
  expiresInSeconds: 7200,
  user: demoUser,
}

function authMeHandler(user: User = demoUser) {
  return http.get('/api/auth/me', () => HttpResponse.json(user))
}

function LoginButtons() {
  const { login, loginDemo } = useAuth()

  return (
    <>
      <button
        type="button"
        onClick={() => void login({ username: 'admin', password: 'secret' })}
      >
        Login
      </button>
      <button type="button" onClick={() => void loginDemo()}>Demo</button>
    </>
  )
}

function AuthStatus() {
  const { user } = useAuth()
  return <h1>{user?.fullName ?? 'Sin usuario'}</h1>
}

function renderAuthRoutes(initialEntries = [routePaths.login]) {
  return renderWithProviders(
    <AuthProvider>
      <Routes>
        <Route path={routePaths.login} element={<><h1>Login</h1><LoginButtons /></>} />
        <Route element={<ProtectedRoute />}>
          <Route path={routePaths.dashboard} element={<AuthStatus />} />
          <Route path="/protected" element={<h1>Contenido protegido</h1>} />
        </Route>
      </Routes>
    </AuthProvider>,
    { initialEntries },
  )
}

describe('AuthProvider', () => {
  it('stores the normal login session and redirects to the dashboard without a reload', async () => {
    const user = userEvent.setup()
    server.use(authMeHandler())
    vi.spyOn(authDependencies.loginUseCase, 'execute').mockResolvedValue(demoSession)

    renderAuthRoutes()

    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(await screen.findByRole('heading', { name: 'Demo User' })).toBeInTheDocument()
    expect(tokenStorage.getToken()).toBe('demo-token')
    expect(tokenStorage.getTokenType()).toBe('Bearer')
  })

  it('stores the demo session and redirects to the dashboard after demo login', async () => {
    const user = userEvent.setup()
    server.use(authMeHandler())
    vi.spyOn(authDependencies.loginDemoUseCase, 'execute').mockResolvedValue(demoSession)

    renderAuthRoutes()

    await user.click(screen.getByRole('button', { name: 'Demo' }))

    expect(await screen.findByRole('heading', { name: 'Demo User' })).toBeInTheDocument()
    expect(tokenStorage.getToken()).toBe('demo-token')
    expect(tokenStorage.getTokenType()).toBe('Bearer')
  })

  it('enters the dashboard when a delayed demo login eventually succeeds', async () => {
    const user = userEvent.setup()
    let finishDemoLogin: ((session: AuthSession) => void) | undefined
    server.use(authMeHandler())
    vi.spyOn(authDependencies.loginDemoUseCase, 'execute').mockImplementation(() => new Promise((resolve) => {
      finishDemoLogin = resolve
    }))

    renderAuthRoutes()

    await user.click(screen.getByRole('button', { name: 'Demo' }))

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()

    finishDemoLogin?.(demoSession)

    expect(await screen.findByRole('heading', { name: 'Demo User' })).toBeInTheDocument()
    expect(tokenStorage.getToken()).toBe('demo-token')
  })

  it('does not show an endless validation screen when the user query is disabled', async () => {
    renderAuthRoutes(['/protected'])

    expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument()
    expect(screen.queryByText('Validando sesión...')).not.toBeInTheDocument()
  })

  it('validates an existing stored session and allows the protected route', async () => {
    tokenStorage.setToken('Bearer', 'existing-token')
    server.use(authMeHandler())

    renderAuthRoutes(['/protected'])

    expect(await screen.findByRole('heading', { name: 'Contenido protegido' })).toBeInTheDocument()
  })

  it('clears an invalid stored token and returns to login', async () => {
    tokenStorage.setToken('Bearer', 'expired-token')
    server.use(
      http.get('/api/auth/me', () => HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })),
    )

    renderAuthRoutes(['/protected'])

    expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument()
    await waitFor(() => {
      expect(tokenStorage.getToken()).toBeNull()
    })
  })
})
