import CloseIcon from '@mui/icons-material/Close'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined'
import { Alert, Button, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, IconButton, Stack, Typography } from '@mui/material'
import { formatCurrency, formatNumber } from '../../../../shared/utils/formatters'
import type { Lot } from '../../domain/entities/Lot'
import { useLot } from '../hooks/useLot'
import { useLotPriceHistory } from '../hooks/useLotPriceHistory'
import { LotStatusChip } from './LotStatusChip'

type LotDetailsPanelProps = {
  lotId: number | null
  onClose(): void
  onEdit(lot: Lot): void
  onStatus(lot: Lot, status: 'AVAILABLE' | 'BLOCKED'): void
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', gap: 2 }}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography sx={{ fontWeight: 600, textAlign: 'right' }}>{value}</Typography>
    </Stack>
  )
}

export function LotDetailsPanel({ lotId, onClose, onEdit, onStatus }: LotDetailsPanelProps) {
  const lotQuery = useLot(lotId)
  const historyQuery = useLotPriceHistory(lotId)
  const open = lotId !== null

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="lot-detail-title">
      <DialogTitle id="lot-detail-title" sx={{ pr: 7 }}>
        Detalle del lote
        <IconButton aria-label="Cerrar detalle" onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {lotQuery.isLoading ? (
          <Stack spacing={2} sx={{ alignItems: 'center', py: 5 }}>
            <CircularProgress size={28} />
            <Typography color="text.secondary">Cargando detalle...</Typography>
          </Stack>
        ) : null}
        {lotQuery.isError ? <Alert severity="error">No fue posible cargar el detalle del lote.</Alert> : null}
        {lotQuery.data ? (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {lotQuery.data.code}
              </Typography>
              <LotStatusChip status={lotQuery.data.status} />
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => onEdit(lotQuery.data!)}>
                Editar
              </Button>
              {lotQuery.data.status === 'AVAILABLE' ? (
                <Button size="small" color="warning" variant="outlined" startIcon={<BlockOutlinedIcon />} onClick={() => onStatus(lotQuery.data!, 'BLOCKED')}>
                  Bloquear
                </Button>
              ) : null}
              {lotQuery.data.status === 'BLOCKED' ? (
                <Button size="small" color="success" variant="outlined" startIcon={<LockOpenOutlinedIcon />} onClick={() => onStatus(lotQuery.data!, 'AVAILABLE')}>
                  Desbloquear
                </Button>
              ) : null}
            </Stack>
            <DetailRow label="Manzana" value={lotQuery.data.blockCode} />
            <DetailRow label="Número" value={lotQuery.data.lotNumber} />
            <DetailRow label="Superficie" value={formatNumber(lotQuery.data.areaM2, ' m²')} />
            <DetailRow label="Frente" value={formatNumber(lotQuery.data.frontMeters, ' m')} />
            <DetailRow label="Fondo" value={formatNumber(lotQuery.data.depthMeters, ' m')} />
            <DetailRow label="Precio" value={formatCurrency(lotQuery.data.price)} />
            <DetailRow label="Referencia" value={lotQuery.data.locationReference ?? 'No disponible'} />
            <DetailRow label="Observaciones" value={lotQuery.data.notes ?? 'No disponible'} />
            <Divider />
            <Stack spacing={1}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Historial de precios</Typography>
              {historyQuery.isLoading ? <Typography color="text.secondary">Cargando historial...</Typography> : null}
              {historyQuery.isError ? <Alert severity="error">No fue posible cargar el historial de precios.</Alert> : null}
              {!historyQuery.isLoading && !historyQuery.isError && historyQuery.data?.length === 0 ? (
                <Typography color="text.secondary">No hay cambios de precio registrados.</Typography>
              ) : null}
              {historyQuery.data?.map((entry) => (
                <Stack key={entry.id} spacing={0.25} sx={{ py: 0.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(entry.previousPrice)} → {formatCurrency(entry.newPrice)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{entry.reason}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {entry.changedBy} · {new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(entry.changedAt))}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
