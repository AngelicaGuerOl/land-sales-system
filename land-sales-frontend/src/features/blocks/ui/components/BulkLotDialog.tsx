import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, TextField, Typography } from '@mui/material'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { BulkLotInput, LandBlock } from '../../domain/entities/LandBlock'
import { bulkLotSchema, type BulkLotFormValues } from '../schemas/bulkLotSchema'

type Values = BulkLotFormValues
type Props = { open: boolean; block: LandBlock | null; pending: boolean; onClose(): void; onSubmit(input: BulkLotInput): void }

function numberValue(value: string) {
  return value.trim() === '' ? null : Number(value)
}

function formatLotNumber(number: number, prefix: string, padding: number) {
  return `${prefix}${String(number).padStart(padding, '0')}`
}

export function BulkLotDialog({ open, block, pending, onClose, onSubmit }: Props) {
  const { control, formState: { errors }, handleSubmit, register, reset } = useForm<Values>({
    resolver: zodResolver(bulkLotSchema),
    defaultValues: { startNumber: '1', endNumber: '', numberPrefix: 'L-', numberPadding: '2', areaM2: '', frontMeters: '', depthMeters: '', currentPrice: '', locationReference: '', notes: '' },
  })
  const start = useWatch({ control, name: 'startNumber' })
  const end = useWatch({ control, name: 'endNumber' })
  const prefix = useWatch({ control, name: 'numberPrefix' })
  const padding = useWatch({ control, name: 'numberPadding' })
  const startNumber = Number(start)
  const endNumber = Number(end)
  const count = Number.isInteger(startNumber) && Number.isInteger(endNumber) && endNumber >= startNumber && startNumber > 0 ? endNumber - startNumber + 1 : 0
  const pendingCapacity = block ? Math.max(block.plannedLotCount - block.registeredLotCount, 0) : 0
  const previewNumbers = count > 0 ? Array.from({ length: Math.min(count, 6) }, (_, index) => startNumber + index) : []
  const previewTail = count > 6 ? Array.from({ length: 3 }, (_, index) => endNumber - 2 + index) : []

  useEffect(() => {
    if (open) reset({ startNumber: '1', endNumber: block ? String(Math.max(block.registeredLotCount + 1, 1)) : '', numberPrefix: 'L-', numberPadding: '2', areaM2: '', frontMeters: '', depthMeters: '', currentPrice: '', locationReference: '', notes: '' })
  }, [block, open, reset])

  function submit(values: Values) {
    onSubmit({ startNumber: Number(values.startNumber), endNumber: Number(values.endNumber), numberPrefix: values.numberPrefix.trim(), numberPadding: Number(values.numberPadding), areaM2: numberValue(values.areaM2), frontMeters: numberValue(values.frontMeters), depthMeters: numberValue(values.depthMeters), currentPrice: numberValue(values.currentPrice), locationReference: values.locationReference.trim() || null, notes: values.notes.trim() || null })
  }

  return <Dialog open={open} onClose={pending ? undefined : onClose} fullWidth maxWidth="md"><DialogTitle>Generar lotes</DialogTitle><DialogContent dividers><Stack component="form" id="bulk-lots-form" onSubmit={handleSubmit(submit)} spacing={2} sx={{ pt: 1 }}><TextField label="Manzana" value={block?.code ?? ''} disabled /><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><TextField label="Número inicial" type="number" error={Boolean(errors.startNumber)} helperText={errors.startNumber?.message} {...register('startNumber')} /><TextField label="Número final" type="number" error={Boolean(errors.endNumber)} helperText={errors.endNumber?.message} {...register('endNumber')} /></Stack><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><TextField label="Prefijo" {...register('numberPrefix')} error={Boolean(errors.numberPrefix)} helperText={errors.numberPrefix?.message} /><TextField label="Cantidad de dígitos" type="number" {...register('numberPadding')} error={Boolean(errors.numberPadding)} helperText={errors.numberPadding?.message} /></Stack><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><TextField label="Superficie predeterminada (m²)" type="number" {...register('areaM2')} error={Boolean(errors.areaM2)} helperText={errors.areaM2?.message} /><TextField label="Frente predeterminado (m)" type="number" {...register('frontMeters')} error={Boolean(errors.frontMeters)} helperText={errors.frontMeters?.message} /><TextField label="Fondo predeterminado (m)" type="number" {...register('depthMeters')} error={Boolean(errors.depthMeters)} helperText={errors.depthMeters?.message} /></Stack><TextField label="Precio predeterminado" type="number" {...register('currentPrice')} error={Boolean(errors.currentPrice)} helperText={errors.currentPrice?.message} /><TextField label="Referencia" {...register('locationReference')} error={Boolean(errors.locationReference)} helperText={errors.locationReference?.message} /><TextField label="Observaciones" multiline minRows={2} {...register('notes')} error={Boolean(errors.notes)} helperText={errors.notes?.message} /><Divider /><Stack spacing={1}><Typography variant="subtitle2">Capacidad de la manzana</Typography><Typography variant="body2" color="text.secondary">Planeados: {block?.plannedLotCount ?? 0} · Registrados: {block?.registeredLotCount ?? 0} · Pendientes: {pendingCapacity} · Se generarán: {count}</Typography>{count > pendingCapacity ? <Alert severity="warning">La cantidad solicitada supera los espacios pendientes.</Alert> : null}<Typography variant="subtitle2">Vista previa</Typography>{count === 0 ? <Typography color="text.secondary">Captura un rango válido para ver la vista previa.</Typography> : <Stack spacing={0.25}>{previewNumbers.map((number) => <Typography key={number} variant="body2" sx={{ fontFamily: 'monospace' }}>{block?.code}-{formatLotNumber(number, prefix, Number(padding))}</Typography>)}{count > 6 ? <Typography variant="body2" color="text.secondary">…</Typography> : null}{previewTail.map((number) => <Typography key={number} variant="body2" sx={{ fontFamily: 'monospace' }}>{block?.code}-{formatLotNumber(number, prefix, Number(padding))}</Typography>)}</Stack>}</Stack></Stack></DialogContent><DialogActions><Button onClick={onClose} disabled={pending}>Cancelar</Button><Button type="submit" form="bulk-lots-form" variant="contained" disabled={pending || count === 0 || count > pendingCapacity}>{pending ? 'Generando...' : 'Generar lotes'}</Button></DialogActions></Dialog>
}
