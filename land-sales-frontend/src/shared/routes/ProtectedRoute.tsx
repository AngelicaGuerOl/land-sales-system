import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth'
import { LoadingScreen } from '../ui/components/LoadingScreen'
import { routePaths } from './routePaths'

export function ProtectedRoute() {
  const location = useLocation()
  const { hasSession, isAuthenticated, isLoadingUser } = useAuth()

  if (hasSession && isLoadingUser) {
    return <LoadingScreen message="Validando sesión..." />
  }

  if (!isAuthenticated) {
    return <Navigate to={routePaths.login} replace state={{ from: location }} />
  }

  return <Outlet />
}
