import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import LandscapeOutlinedIcon from '@mui/icons-material/LandscapeOutlined'
import SellOutlinedIcon from '@mui/icons-material/SellOutlined'
import { Box, Paper, Stack, Typography } from '@mui/material'
import type { ReactElement } from 'react'
import type { Lot } from '../../../lots/domain/entities/Lot'

type DashboardLotSummaryProps = { lots: Lot[] }

const summaryItems: Array<{ label: string; status: Lot['status'] | 'TOTAL'; color: string; icon: ReactElement }> = [
  { label: 'Total de lotes', status: 'TOTAL', color: 'primary.main', icon: <LandscapeOutlinedIcon /> },
  { label: 'Disponibles', status: 'AVAILABLE', color: 'success.main', icon: <CheckCircleOutlineRoundedIcon /> },
  { label: 'Vendidos', status: 'SOLD', color: 'secondary.main', icon: <SellOutlinedIcon /> },
  { label: 'Bloqueados', status: 'BLOCKED', color: 'warning.main', icon: <BlockOutlinedIcon /> },
]

export function DashboardLotSummary({ lots }: DashboardLotSummaryProps) {
  return <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5 }}>{summaryItems.map((item) => { const count = item.status === 'TOTAL' ? lots.length : lots.filter((lot) => lot.status === item.status).length; return <Paper key={item.label} elevation={0} sx={{ p: { xs: 1.75, md: 2 }, minHeight: 116, border: 1, borderColor: 'divider', borderRadius: 2, position: 'relative', overflow: 'hidden' }}><Stack spacing={1.25}><Box sx={{ width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: 1.5, color: item.color, bgcolor: 'action.hover' }}>{item.icon}</Box><Typography variant="body2" color="text.secondary" sx={{ fontSize: 14 }}>{item.label}</Typography><Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.875rem', md: '2rem' }, lineHeight: 1, color: item.color }}>{count}</Typography></Stack></Paper> })}</Box>
}
