import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import AddBusinessOutlinedIcon from '@mui/icons-material/AddBusinessOutlined'
import AddHomeWorkOutlinedIcon from '@mui/icons-material/AddHomeWorkOutlined'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import LandscapeOutlinedIcon from '@mui/icons-material/LandscapeOutlined'
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined'
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { routePaths } from '../../../../shared/routes/routePaths'
import { EmptyState } from '../../../../shared/ui/components/EmptyState'
import { LoadingScreen } from '../../../../shared/ui/components/LoadingScreen'
import { PageContainer } from '../../../../shared/ui/layout/PageContainer'
import { useLots } from '../../../lots/ui/hooks/useLots'
import { DashboardLotSummary } from '../components/DashboardLotSummary'

const quickActions = [
  { label: 'Registrar lote', description: 'Agrega un terreno disponible.', path: routePaths.lots, icon: <AddHomeWorkOutlinedIcon /> },
  { label: 'Registrar manzana', description: 'Organiza una nueva manzana.', path: routePaths.blocks, icon: <AddBusinessOutlinedIcon /> },
  { label: 'Nueva venta', description: 'Inicia una operación de venta.', path: routePaths.newSale, icon: <PointOfSaleOutlinedIcon /> },
  { label: 'Estado de cuenta', description: 'Consulta saldos de clientes.', path: routePaths.accountStatements, icon: <AccountBalanceWalletOutlinedIcon /> },
]

export function DashboardPage() {
  const lotsQuery = useLots({})

  if (lotsQuery.isLoading) return <LoadingScreen message="Cargando resumen..." />
  if (lotsQuery.isError) return <PageContainer><Alert severity="error">No fue posible cargar el resumen de lotes.</Alert></PageContainer>

  const lots = lotsQuery.data ?? []

  if (lots.length === 0) return <PageContainer><EmptyState title="Sin lotes registrados" description="Aún no hay lotes registrados para consultar." /></PageContainer>

  return <PageContainer><Stack spacing={{ xs: 2.5, md: 3 }}>
    <Paper sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 3, color: 'primary.contrastText', background: 'linear-gradient(115deg, #0e5d54 0%, #136f63 58%, #1d8173 100%)', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 620 }}><Typography variant="overline" sx={{ letterSpacing: 1.4, opacity: 0.78, fontWeight: 700 }}>RESUMEN OPERATIVO</Typography><Typography variant="h3" sx={{ mt: 0.5, fontWeight: 800, fontSize: { xs: '2rem', md: '2.6rem' }, lineHeight: 1.1 }}>Bienvenida </Typography><Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.8)', maxWidth: 520 }}>Consulta el estado general de la lotificación.</Typography></Box><LandscapeOutlinedIcon sx={{ position: 'absolute', right: { xs: -24, md: 34 }, bottom: { xs: -24, md: -16 }, fontSize: { xs: 150, md: 190 }, color: 'rgba(255,255,255,0.10)' }} /></Paper>
    <Stack spacing={1}><Typography variant="h5" sx={{ fontWeight: 800 }}>Disponibilidad de lotes</Typography><Typography color="text.secondary">Estado actual de los terrenos registrados.</Typography></Stack>
    <DashboardLotSummary lots={lots} />
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.1fr) minmax(360px, 0.9fr)' }, gap: 2 }}>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}><Stack spacing={2}><Box><Typography variant="h6" sx={{ fontWeight: 800 }}>Distribución actual</Typography><Typography variant="body2" color="text.secondary">Una vista rápida del inventario por estado.</Typography></Box><Box sx={{ display: 'flex', height: 12, overflow: 'hidden', borderRadius: 6, bgcolor: 'grey.100' }}>{[['AVAILABLE', 'success.main'], ['SOLD', 'secondary.main'], ['BLOCKED', 'warning.main']].map(([status, color]) => { const count = lots.filter((lot) => lot.status === status).length; const width = lots.length ? `${(count / lots.length) * 100}%` : '0%'; return <Box key={status} sx={{ width, bgcolor: color, transition: 'width 300ms ease' }} /> })}</Box><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>{[['Disponible', 'AVAILABLE', 'success.main'], ['Vendido', 'SOLD', 'secondary.main'], ['Bloqueado', 'BLOCKED', 'warning.main']].map(([label, status, color]) => <Stack key={status} direction="row" spacing={1} sx={{ alignItems: 'center' }}><Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: color }} /><Typography variant="body2" color="text.secondary">{label}: <strong>{lots.filter((lot) => lot.status === status).length}</strong></Typography></Stack>)}</Stack></Stack></Paper>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}><Stack spacing={1.5}><Box><Typography variant="h6" sx={{ fontWeight: 800 }}>Acciones rápidas</Typography><Typography variant="body2" color="text.secondary">Accede directamente a las tareas principales.</Typography></Box>{quickActions.map((action) => <Button key={action.path} component={RouterLink} to={action.path} variant="text" color="inherit" sx={{ justifyContent: 'space-between', textAlign: 'left', px: 1, py: 1, borderRadius: 1.5, '&:hover': { bgcolor: 'action.hover' } }}><Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}><Box sx={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 1.5, bgcolor: 'primary.50', color: 'primary.main' }}>{action.icon}</Box><Box><Typography variant="body2" sx={{ fontWeight: 700 }}>{action.label}</Typography><Typography variant="caption" color="text.secondary">{action.description}</Typography></Box></Stack><ArrowForwardRoundedIcon fontSize="small" color="action" /></Button>)}</Stack></Paper>
    </Box>
  </Stack></PageContainer>
}
