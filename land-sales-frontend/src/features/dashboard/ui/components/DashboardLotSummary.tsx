import { Box, Paper, Stack, Typography } from '@mui/material'
import type { Lot } from '../../../lots/domain/entities/Lot'

type DashboardLotSummaryProps = { lots: Lot[] }

const summaryItems: Array<{ label: string; status: Lot['status'] | 'TOTAL'; color: string }> = [
  { label: 'Total de lotes', status: 'TOTAL', color: 'primary.main' },
  { label: 'Disponibles', status: 'AVAILABLE', color: 'success.main' },
  { label: 'Vendidos', status: 'SOLD', color: 'text.secondary' },
  { label: 'Bloqueados', status: 'BLOCKED', color: 'warning.main' },
]

export function DashboardLotSummary({ lots }: DashboardLotSummaryProps) {
  return <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 1.25 }}>{summaryItems.map((item) => { const count = item.status === 'TOTAL' ? lots.length : lots.filter((lot) => lot.status === item.status).length; return <Paper key={item.label} elevation={0} sx={{ p: 2, minHeight: 100, border: 1, borderColor: 'divider', borderRadius: 2 }}><Stack spacing={0.25}><Typography variant="body2" color="text.secondary" sx={{ fontSize: 14 }}>{item.label}</Typography><Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.875rem', md: '2rem' }, lineHeight: 1.1, color: item.color }}>{count}</Typography></Stack></Paper> })}</Box>
}
