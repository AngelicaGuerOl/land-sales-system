import { Navigate, Route } from 'react-router-dom'
import { LoginPage } from '../../features/auth'
import { LotMapPage } from '../../features/lotMap'
import { ProtectedRoute } from '../../shared/routes/ProtectedRoute'
import { PublicRoute } from '../../shared/routes/PublicRoute'
import { routePaths } from '../../shared/routes/routePaths'
import { DashboardLayout } from '../../shared/ui/layout/DashboardLayout'
import { NotFoundPage } from '../../shared/ui/pages/NotFoundPage'

export const routes = (
  <>
    <Route element={<PublicRoute />}>
      <Route path={routePaths.login} element={<LoginPage />} />
    </Route>
    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path={routePaths.lotMap} element={<LotMapPage />} />
      </Route>
    </Route>
    <Route path="/" element={<Navigate to={routePaths.lotMap} replace />} />
    <Route path="*" element={<NotFoundPage />} />
  </>
)
