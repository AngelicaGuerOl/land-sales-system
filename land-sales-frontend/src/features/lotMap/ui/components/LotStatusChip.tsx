import { Chip } from '@mui/material'
import type { LotStatus } from '../../domain/entities/Lot'

const statusLabels: Record<LotStatus, string> = {
  AVAILABLE: 'Disponible',
  SOLD: 'Vendido',
  BLOCKED: 'Bloqueado',
}

const statusColors: Record<LotStatus, 'success' | 'default' | 'warning'> = {
  AVAILABLE: 'success',
  SOLD: 'default',
  BLOCKED: 'warning',
}

type LotStatusChipProps = {
  status: LotStatus
}

export function LotStatusChip({ status }: LotStatusChipProps) {
  return <Chip size="small" label={statusLabels[status]} color={statusColors[status]} />
}
