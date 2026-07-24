import { Divider, Paper, Stack, Typography } from '@mui/material'
import { formatCurrency, formatNumber } from '../../../../shared/utils/formatters'
import type { Lot } from '../../domain/entities/Lot'
import { LotStatusChip } from './LotStatusChip'

type LotDetailsPanelProps = {
  lot: Lot | null
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography sx={{ fontWeight: 600, textAlign: 'right' }}>
        {value}
      </Typography>
    </Stack>
  )
}

export function LotDetailsPanel({ lot }: LotDetailsPanelProps) {
  return (
    <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider', height: '100%' }}>
      <Stack spacing={2.25}>
        <Stack spacing={0.5}>
          <Typography variant="h6">Detalle del lote</Typography>
          <Typography color="text.secondary">
            {lot ? 'Información del lote seleccionado.' : 'Selecciona un lote del mapa o del resultado filtrado.'}
          </Typography>
        </Stack>
        <Divider />
        {lot ? (
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {lot.code}
              </Typography>
              <LotStatusChip status={lot.status} />
            </Stack>
            <DetailRow label="Manzana" value={lot.blockCode} />
            <DetailRow label="Número" value={lot.lotNumber} />
            <DetailRow label="Superficie" value={formatNumber(lot.areaM2, ' m²')} />
            <DetailRow label="Frente" value={formatNumber(lot.frontMeters, ' m')} />
            <DetailRow label="Fondo" value={formatNumber(lot.depthMeters, ' m')} />
            <DetailRow label="Precio" value={formatCurrency(lot.price)} />
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  )
}
