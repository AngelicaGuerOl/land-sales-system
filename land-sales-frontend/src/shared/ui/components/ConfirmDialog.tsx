import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  pending?: boolean
  onClose(): void
  onConfirm(): void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pending = false,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={pending ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">{description}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={pending}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant="contained" disabled={pending}>
          {pending ? 'Guardando...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
