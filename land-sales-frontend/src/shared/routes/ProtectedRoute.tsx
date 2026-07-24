import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth'
import { tokenStorage } from '../lib/storage/tokenStorage'
import { LoadingScreen } from '../ui/components/LoadingScreen'
import { routePaths } from './routePaths'

export function ProtectedRoute() {
  const location = useLocation()
  const { isLoadingUser } = useAuth()

  if (!tokenStorage.getToken()) {
    return <Navigate to={routePaths.login} replace state={{ from: location }} />
  }

  if (isLoadingUser) {
    return <LoadingScreen message="Validando sesión..." />
  }

  return <Outlet />
}
