import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  details?: ReactNode
  pending?: boolean
  onClose(): void
  onConfirm(): void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  details,
  pending = false,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={pending ? undefined : onClose} maxWidth={details ? 'sm' : 'xs'} fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">{description}</Typography>
        {details}
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
