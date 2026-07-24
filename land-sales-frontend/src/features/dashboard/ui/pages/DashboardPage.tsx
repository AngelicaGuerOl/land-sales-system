import { Alert, Stack, Typography } from '@mui/material'
import { EmptyState } from '../../../../shared/ui/components/EmptyState'
import { LoadingScreen } from '../../../../shared/ui/components/LoadingScreen'
import { PageContainer } from '../../../../shared/ui/layout/PageContainer'
import { useLotifications } from '../../../lots/ui/hooks/useLotifications'
import { useLots } from '../../../lots/ui/hooks/useLots'
import { DashboardLotSummary } from '../components/DashboardLotSummary'

export function DashboardPage() {
  const lotificationsQuery = useLotifications()
  const lotificationId = lotificationsQuery.data?.find((lotification) => lotification.active)?.id ?? null
  const lotsQuery = useLots(lotificationId === null ? null : { lotificationId })

  if (lotificationsQuery.isLoading || lotsQuery.isLoading) return <LoadingScreen message="Cargando resumen..." />
  if (lotificationsQuery.isError || lotsQuery.isError) return <PageContainer><Alert severity="error">No fue posible cargar el resumen de lotes.</Alert></PageContainer>
  if (lotificationId === null) return <PageContainer><EmptyState title="Sin lotificaciones" description="Aún no hay lotificaciones registradas para consultar." /></PageContainer>

  return <PageContainer><Stack spacing={2}><Stack spacing={0.25}><Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2rem' }, lineHeight: 1.15 }}>Dashboard</Typography><Typography color="text.secondary">Resumen de disponibilidad de lotes.</Typography></Stack><DashboardLotSummary lots={lotsQuery.data ?? []} /></Stack></PageContainer>
}
