import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, InputAdornment, InputLabel, MenuItem, Select, Stack, Tab, Tabs, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { ApiError } from '../../../../shared/api/apiError'
import { ConfirmDialog } from '../../../../shared/ui/components/ConfirmDialog'
import { formatCurrency } from '../../../../shared/utils/formatters'
import type { AccountStatement, StatementInstallment, StatementLot } from '../../domain/entities/AccountStatement'
import { paymentDependencies } from '../../../payments/dependencies'
import type { PaymentDetail, PaymentMethod } from '../../../payments/domain/entities/Payment'
import { paymentSchema, type PaymentFormValues } from '../../../payments/ui/schemas/paymentSchema'

type Props = { open: boolean; statement: AccountStatement; onClose: () => void; onSuccess: (payment: PaymentDetail) => void; onOpenReceipt: (id: number) => void }
type Selected = Record<number, Record<number, number>>
type PayableLot = StatementLot & { saleFolio: string }

const monthLabel = (value: string) => new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(new Date(`${value.slice(0, 7)}-01T00:00:00`))

function unpaid(lot: StatementLot) {
  return lot.installments
    .filter((item) => item.status !== 'PAID' && item.outstandingAmount > 0)
    .sort((left, right) => left.paymentMonth.localeCompare(right.paymentMonth) || left.installmentNumber - right.installmentNumber)
}

function cents(value: number) { return Math.round(value * 100) }
function amountLabel(value: number) { return formatCurrency(cents(value) / 100) }
function inputAmountLabel(value: number) { return new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents(value) / 100) }

export function RegisterPaymentDialog({ open, statement, onClose, onSuccess, onOpenReceipt }: Props) {
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('sm'))
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Selected>({})
  const [activeTab, setActiveTab] = useState(0)
  const [editingInstallmentId, setEditingInstallmentId] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [success, setSuccess] = useState<PaymentDetail | null>(null)
  const { control, handleSubmit, reset } = useForm<PaymentFormValues>({ resolver: zodResolver(paymentSchema), defaultValues: { paymentMethod: 'CASH', reference: '' } })
  const method = useWatch({ control, name: 'paymentMethod' })
  const reference = useWatch({ control, name: 'reference' })

  const availableLots: PayableLot[] = statement.sales
    .flatMap((sale) => sale.lots.map((lot) => ({ ...lot, saleFolio: sale.folio })))
    .filter((lot) => lot.outstandingBalance > 0 && unpaid(lot).length > 0)
    .sort((left, right) => left.code.localeCompare(right.code))

  const selectedLots = availableLots.filter((lot) => Object.keys(selected[lot.saleLotId] ?? {}).length > 0)
  const selectedCount = selectedLots.reduce((sum, lot) => sum + Object.keys(selected[lot.saleLotId] ?? {}).length, 0)
  const allocations = selectedLots.map((lot) => ({ saleLotId: lot.saleLotId, installments: Object.entries(selected[lot.saleLotId]).map(([installmentId, amount]) => ({ installmentId: Number(installmentId), amount: cents(amount) / 100 })) }))
  const totalCents = allocations.reduce((sum, allocation) => sum + allocation.installments.reduce((inner, item) => inner + cents(item.amount), 0), 0)
  const isValid = totalCents > 0 && selectedLots.every((lot) => {
    const items = unpaid(lot)
    const selection = selected[lot.saleLotId] ?? {}
    const selectedItems = items.filter((item) => selection[item.id] !== undefined)
    return selectedItems.length > 0 && selectedItems.every((item, index) => {
      const value = cents(selection[item.id])
      const remaining = cents(item.outstandingAmount)
      return value > 0 && value <= remaining && (index === selectedItems.length - 1 || value === remaining)
    })
  })

  const mutation = useMutation({
    mutationFn: (values: PaymentFormValues) => paymentDependencies.createUseCase.execute({ customerId: statement.customer.id, paymentMethod: values.paymentMethod as PaymentMethod, reference: values.reference?.trim() || null, allocations }),
    onSuccess: (payment) => {
      setSuccess(payment)
      onSuccess(payment)
      void queryClient.invalidateQueries({ queryKey: ['customer-statement', statement.customer.id] })
      void queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
  })

  function close() {
    setSelected({})
    setActiveTab(0)
    setEditingInstallmentId(null)
    setConfirmOpen(false)
    setSuccess(null)
    reset()
    mutation.reset()
    onClose()
  }

  function toggleInstallment(lot: StatementLot, installment: StatementInstallment, checked: boolean) {
    const items = unpaid(lot)
    const index = items.findIndex((item) => item.id === installment.id)
    setSelected((current) => {
      const next = { ...current, [lot.saleLotId]: { ...(current[lot.saleLotId] ?? {}) } }
      if (checked) {
        const currentSelection = next[lot.saleLotId]
        const priorPartial = items.slice(0, index).some((item) => currentSelection[item.id] !== undefined && cents(currentSelection[item.id]) < cents(item.outstandingAmount))
        if (priorPartial) return current
        items.slice(0, index + 1).forEach((item) => {
          if (next[lot.saleLotId][item.id] === undefined) next[lot.saleLotId][item.id] = item.outstandingAmount
        })
      } else {
        items.slice(index).forEach((item) => { delete next[lot.saleLotId][item.id] })
        if (Object.keys(next[lot.saleLotId]).length === 0) delete next[lot.saleLotId]
      }
      return next
    })
  }

  function changeAmount(lotId: number, installmentId: number, value: string) {
    const normalized = value.replace(/[^\d.,]/g, '').replace(',', '.')
    const amount = Number(normalized)
    setSelected((current) => ({ ...current, [lotId]: { ...current[lotId], [installmentId]: Number.isFinite(amount) ? cents(amount) / 100 : 0 } }))
  }

  function submit() { if (isValid) setConfirmOpen(true) }
  function confirm(values: PaymentFormValues) { mutation.mutate(values); setConfirmOpen(false) }

  const safeActiveTab = Math.min(activeTab, Math.max(availableLots.length - 1, 0))
  const activeLot = availableLots[safeActiveTab]
  const activeSelection = activeLot ? selected[activeLot.saleLotId] ?? {} : {}
  const activeItems = activeLot ? unpaid(activeLot) : []
  const activeSelectedItems = activeItems.filter((item) => activeSelection[item.id] !== undefined)
  const activeLastId = activeSelectedItems.at(-1)?.id
  const confirmationDetails = <Stack spacing={1.25} sx={{ mt: 2 }}><Typography><strong>Cliente:</strong> {statement.customer.fullName} · {statement.customer.phone}</Typography><Typography><strong>Forma de pago:</strong> {method === 'TRANSFER' ? 'Transferencia' : 'Efectivo'}{method === 'TRANSFER' && reference?.trim() ? ` · Referencia: ${reference.trim()}` : ''}</Typography>{selectedLots.map((lot) => <Box key={lot.saleLotId}><Typography sx={{ fontWeight: 700 }}>{lot.code}: {amountLabel(Object.values(selected[lot.saleLotId]).reduce((sum, amount) => sum + amount, 0))}</Typography><Typography variant="body2" color="text.secondary">{Object.keys(selected[lot.saleLotId]).length} {Object.keys(selected[lot.saleLotId]).length === 1 ? 'mensualidad' : 'mensualidades'}</Typography></Box>)}<Typography sx={{ fontWeight: 700 }}>Total recibido: {amountLabel(totalCents / 100)}</Typography></Stack>

  return <Dialog open={open} onClose={mutation.isPending ? undefined : close} fullWidth maxWidth="lg" fullScreen={mobile} slotProps={{ paper: { sx: { maxHeight: mobile ? '100%' : 'calc(100vh - 48px)' } } }}>
    <DialogTitle sx={{ flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}><Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}><Box><Typography variant="h6">Registrar pago</Typography><Typography variant="body2" color="text.secondary">{statement.customer.fullName} · {statement.customer.phone}</Typography></Box><Button aria-label="Cerrar" onClick={close} disabled={mutation.isPending} size="small" startIcon={<CloseRoundedIcon />}>Cerrar</Button></Stack></DialogTitle>
    <DialogContent dividers sx={{ overflow: 'hidden', flex: 1, minHeight: 0 }}>
      {success ? <Stack spacing={2} sx={{ py: 3, alignItems: 'center', textAlign: 'center' }}><Typography variant="h5" sx={{ fontWeight: 700 }}>Pago registrado correctamente</Typography><Typography>Folio: {success.paymentNumber}</Typography><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="contained" onClick={() => onOpenReceipt(success.id)}>Ver recibo</Button><Button variant="outlined" onClick={() => onOpenReceipt(success.id)}>Imprimir recibo</Button><Button onClick={close}>Volver al estado de cuenta</Button></Stack></Stack> : <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Controller name="paymentMethod" control={control} render={({ field }) => <FormControl sx={{ minWidth: 190 }}><InputLabel>Forma de pago</InputLabel><Select {...field} label="Forma de pago"><MenuItem value="CASH">Efectivo</MenuItem><MenuItem value="TRANSFER">Transferencia</MenuItem></Select></FormControl>} />{method === 'TRANSFER' ? <Controller name="reference" control={control} render={({ field }) => <TextField {...field} fullWidth label="Referencia (opcional)" />} /> : null}</Stack>
        <Tabs value={safeActiveTab} onChange={(_, value: number) => setActiveTab(value)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile aria-label="Lotes con saldo pendiente">{availableLots.map((lot, index) => { const count = Object.keys(selected[lot.saleLotId] ?? {}).length; const subtotal = Object.values(selected[lot.saleLotId] ?? {}).reduce((sum, amount) => sum + amount, 0); return <Tab key={lot.saleLotId} id={`payment-lot-tab-${lot.saleLotId}`} aria-controls={`payment-lot-panel-${lot.saleLotId}`} aria-label={`${lot.code}, ${count === 0 ? 'sin selección' : `${count} ${count === 1 ? 'mensualidad' : 'mensualidades'} seleccionadas`}`} label={<Stack sx={{ alignItems: 'flex-start', textAlign: 'left' }}><Typography variant="body2" sx={{ fontWeight: 700 }}>{lot.code}</Typography><Typography variant="caption" color={count > 0 ? 'primary.main' : 'text.secondary'}>{count === 0 ? 'Sin selección' : `${count} ${count === 1 ? 'mensualidad' : 'mensualidades'} · ${amountLabel(subtotal)}`}</Typography></Stack>} value={index} /> })}</Tabs>
        {activeLot ? <Box role="tabpanel" id={`payment-lot-panel-${activeLot.saleLotId}`} aria-labelledby={`payment-lot-tab-${activeLot.saleLotId}`}><Box sx={{ maxHeight: { xs: 'calc(100vh - 300px)', sm: 420 }, overflowY: 'auto', border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}>{activeItems.map((item) => { const checked = activeSelection[item.id] !== undefined; const editable = checked && item.id === activeLastId; const applied = activeSelection[item.id] ?? 0; const amountInvalid = cents(applied) <= 0 || cents(applied) > cents(item.outstandingAmount); return <Stack key={item.id} direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 1, py: 1, px: 0.5, bgcolor: checked ? 'action.selected' : 'transparent', borderRadius: 1 }}><FormControlLabel control={<Checkbox checked={checked} onChange={(event) => toggleInstallment(activeLot, item, event.target.checked)} />} label={<Typography>{item.installmentNumber}. {monthLabel(item.paymentMonth)}</Typography>} />{editable ? <Stack sx={{ minWidth: { sm: 210 }, width: { xs: '100%', sm: 'auto' } }}><TextField label="Monto a aplicar" type="text" inputMode="decimal" size="small" value={editingInstallmentId === item.id ? applied.toFixed(2) : inputAmountLabel(applied)} error={amountInvalid} onFocus={() => setEditingInstallmentId(item.id)} onBlur={() => setEditingInstallmentId(null)} onChange={(event) => changeAmount(activeLot.saleLotId, item.id, event.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> }, htmlInput: { inputMode: 'decimal', 'aria-label': `Monto a aplicar para la mensualidad ${item.installmentNumber}` } }} helperText={amountInvalid ? 'Ingresa un monto válido.' : undefined} /></Stack> : null}</Stack>})}</Box></Box> : <Alert severity="info">No hay lotes con mensualidades pendientes.</Alert>}
        {mutation.isError ? <Alert severity="error">{mutation.error instanceof ApiError ? mutation.error.message : 'No fue posible registrar el pago.'}</Alert> : null}
      </Stack>}
    </DialogContent>
    <DialogActions sx={{ flexShrink: 0, position: 'sticky', bottom: 0, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', display: 'block', p: 2 }}><Stack spacing={1}><Typography variant="body2">{selectedLots.length} {selectedLots.length === 1 ? 'lote incluido' : 'lotes incluidos'} · {selectedCount} {selectedCount === 1 ? 'mensualidad seleccionada' : 'mensualidades seleccionadas'}</Typography>{selectedLots.map((lot) => <Typography key={lot.saleLotId} variant="body2">{lot.code}: {amountLabel(Object.values(selected[lot.saleLotId]).reduce((sum, amount) => sum + amount, 0))}</Typography>)}<Typography variant="h6">Total del pago: {amountLabel(totalCents / 100)}</Typography><Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}><Button onClick={close}>Cancelar</Button><Button variant="contained" disabled={!isValid || mutation.isPending} onClick={handleSubmit(submit)}>{mutation.isPending ? 'Procesando...' : 'Revisar pago'}</Button></Stack></Stack></DialogActions>
    <ConfirmDialog open={confirmOpen} title="Confirmar pago" description="Al confirmar, el pago se aplicará a las mensualidades seleccionadas y se actualizarán los saldos." details={confirmationDetails} confirmLabel="Confirmar pago" pending={mutation.isPending} onClose={() => setConfirmOpen(false)} onConfirm={handleSubmit(confirm)} />
  </Dialog>
}
