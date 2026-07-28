import { screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext, type AuthContextValue } from '../../features/auth/ui/hooks/AuthContext'
import { tokenStorage } from '../lib/storage/tokenStorage'
import { renderWithProviders } from '../../test/render'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { routePaths } from './routePaths'

function LocationLabel() {
  const location = useLocation()
  return <span>Ruta actual: {location.pathname}</span>
}

function authValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    user: null,
    isLoadingUser: false,
    login: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn(),
    ...overrides,
  }
}

function AuthWrapper({ children, value = authValue() }: { children: ReactNode; value?: AuthContextValue }) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to the login route', async () => {
    renderWithProviders(
      <AuthWrapper>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protegido" element={<h1>Contenido protegido</h1>} />
          </Route>
          <Route path={routePaths.login} element={<><h1>Login</h1><LocationLabel /></>} />
        </Routes>
      </AuthWrapper>,
      { initialEntries: ['/protegido'] },
    )

    expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByText(`Ruta actual: ${routePaths.login}`)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Contenido protegido' })).not.toBeInTheDocument()
  })

  it('renders protected content when a token exists', () => {
    tokenStorage.setToken('Bearer', 'valid-token')

    renderWithProviders(
      <AuthWrapper value={authValue({ user: { id: 1, username: 'admin', fullName: 'Admin User' } })}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protegido" element={<h1>Contenido protegido</h1>} />
          </Route>
          <Route path={routePaths.login} element={<h1>Login</h1>} />
        </Routes>
      </AuthWrapper>,
      { initialEntries: ['/protegido'] },
    )

    expect(screen.getByRole('heading', { name: 'Contenido protegido' })).toBeInTheDocument()
  })
})

describe('PublicRoute', () => {
  it('renders public content when there is no token', () => {
    renderWithProviders(
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path={routePaths.login} element={<h1>Ruta pública</h1>} />
        </Route>
        <Route path={routePaths.dashboard} element={<h1>Dashboard</h1>} />
      </Routes>,
      { initialEntries: [routePaths.login] },
    )

    expect(screen.getByRole('heading', { name: 'Ruta pública' })).toBeInTheDocument()
  })

  it('redirects authenticated users to the dashboard route', async () => {
    tokenStorage.setToken('Bearer', 'valid-token')

    renderWithProviders(
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path={routePaths.login} element={<><h1>Ruta pública</h1><Link to="/">Inicio</Link></>} />
        </Route>
        <Route path={routePaths.dashboard} element={<><h1>Dashboard</h1><LocationLabel /></>} />
      </Routes>,
      { initialEntries: [routePaths.login] },
    )

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText(`Ruta actual: ${routePaths.dashboard}`)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Ruta pública' })).not.toBeInTheDocument()
  })
})
