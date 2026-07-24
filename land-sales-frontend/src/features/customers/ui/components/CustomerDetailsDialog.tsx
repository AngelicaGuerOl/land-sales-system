import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import { Alert, Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material'
import type { Customer } from '../../domain/entities/Customer'
import { useCustomer } from '../hooks/useCustomer'
import { CustomerStatusChip } from './CustomerStatusChip'

type Props = { customerId: number | null; onClose(): void; onEdit(customer: Customer): void }

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}><Typography color="text.secondary">{label}</Typography><Typography sx={{ fontWeight: 600, textAlign: { sm: 'right' }, whiteSpace: 'pre-wrap' }}>{value}</Typography></Stack>
}

export function CustomerDetailsDialog({ customerId, onClose, onEdit }: Props) {
  const query = useCustomer(customerId)
  const customer = query.data
  return (
    <Dialog open={customerId !== null} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 7 }}>
        Detalle del cliente
        <IconButton aria-label="Cerrar detalle del cliente" onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12 }}><CloseRoundedIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {query.isLoading ? <Stack spacing={2} sx={{ alignItems: 'center', py: 5 }}><CircularProgress size={28} /><Typography color="text.secondary">Cargando detalle...</Typography></Stack> : null}
        {query.isError ? <Alert severity="error">No fue posible cargar el detalle del cliente.</Alert> : null}
        {customer ? <Stack spacing={2}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}><Typography variant="h5" sx={{ fontWeight: 700 }}>{customer.fullName}</Typography><CustomerStatusChip active={customer.active} /></Stack>
          <Button variant="outlined" size="small" startIcon={<EditRoundedIcon />} onClick={() => onEdit(customer)} sx={{ alignSelf: 'flex-start' }}>Editar</Button>
          <DetailRow label="Teléfono principal" value={customer.phone} />
          <DetailRow label="Teléfono alternativo" value={customer.alternatePhone ?? 'No registrado'} />
          <DetailRow label="Domicilio completo" value={customer.address ?? 'No registrado'} />
          <DetailRow label="Fecha de registro" value={formatDate(customer.createdAt)} />
          <DetailRow label="Última actualización" value={formatDate(customer.updatedAt)} />
        </Stack> : null}
      </DialogContent>
    </Dialog>
  )
}
