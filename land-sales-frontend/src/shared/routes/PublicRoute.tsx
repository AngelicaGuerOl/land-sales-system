import { Navigate, Outlet } from 'react-router-dom'
import { tokenStorage } from '../lib/storage/tokenStorage'
import { routePaths } from './routePaths'

export function PublicRoute() {
  if (tokenStorage.getToken()) {
    return <Navigate to={routePaths.lotMap} replace />
  }

  return <Outlet />
}
