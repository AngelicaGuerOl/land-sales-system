import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { tokenStorage } from '../lib/storage/tokenStorage'
import { routePaths } from './routePaths'

export function ProtectedRoute() {
  const location = useLocation()

  if (!tokenStorage.getToken()) {
    return <Navigate to={routePaths.login} replace state={{ from: location }} />
  }

  return <Outlet />
}
