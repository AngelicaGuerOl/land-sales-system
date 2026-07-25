import { Navigate, Route } from 'react-router-dom'
import { LoginPage } from '../../features/auth'
import { BlocksPage } from '../../features/blocks'
import { CustomersPage } from '../../features/customers'
import { DashboardPage } from '../../features/dashboard'
import { LotsPage } from '../../features/lots'
import { ReferencePlanPage } from '../../features/referencePlan'
import { NewSalePage, SaleDetailPage, SalesPage } from '../../features/sales'
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
        <Route path={routePaths.dashboard} element={<DashboardPage />} />
        <Route path={routePaths.lots} element={<LotsPage />} />
        <Route path={routePaths.blocks} element={<BlocksPage />} />
        <Route path={routePaths.customers} element={<CustomersPage />} />
        <Route path={routePaths.referencePlan} element={<ReferencePlanPage />} />
        <Route path={routePaths.sales} element={<SalesPage />} />
        <Route path={routePaths.newSale} element={<NewSalePage />} />
        <Route path={routePaths.saleDetail} element={<SaleDetailPage />} />
      </Route>
    </Route>
    <Route path="/" element={<Navigate to={routePaths.dashboard} replace />} />
    <Route path="*" element={<NotFoundPage />} />
  </>
)
