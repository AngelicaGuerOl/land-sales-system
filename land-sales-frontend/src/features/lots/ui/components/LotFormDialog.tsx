import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormHelperText, MenuItem, Stack, TextField } from '@mui/material'
import { useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { LotBlockOption, Lot, LotFormInput } from '../../domain/entities/Lot'
import { lotFormSchema, type LotFormValues } from '../schemas/lotFormSchema'

type LotFormDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  lot: Lot | null
  blocks: LotBlockOption[]
  pending?: boolean
  onClose(): void
  onSubmit(input: LotFormInput): void
}

function asString(value: number | null | undefined) {
  return value === null || value === undefined ? '' : String(value)
}

function asNumber(value: string) {
  return value.trim() === '' ? null : Number(value)
}

function sameNumber(left: number | null, right: number | null) {
  if (left === null || right === null) return left === right
  return left === right
}

export function LotFormDialog({ open, mode, lot, blocks, pending = false, onClose, onSubmit }: LotFormDialogProps) {
  const isSold = lot?.status === 'SOLD'
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = useForm<LotFormValues>({
    resolver: zodResolver(lotFormSchema),
    defaultValues: {
      blockId: '',
      lotNumber: '',
      code: '',
      areaM2: '',
      frontMeters: '',
      depthMeters: '',
      currentPrice: '',
      locationReference: '',
      notes: '',
      priceChangeReason: '',
    },
  })
  const watchedBlockId = useWatch({ control, name: 'blockId' })
  const watchedLotNumber = useWatch({ control, name: 'lotNumber' })
  const watchedCode = useWatch({ control, name: 'code' })
  const watchedPrice = useWatch({ control, name: 'currentPrice' })
  const codeEdited = useRef(false)
  const codeRegistration = register('code')

  useEffect(() => {
    if (!open) return
    reset({
      blockId: lot ? String(lot.blockId) : '',
      lotNumber: lot?.lotNumber ?? '',
      code: lot?.code ?? '',
      areaM2: asString(lot?.areaM2),
      frontMeters: asString(lot?.frontMeters),
      depthMeters: asString(lot?.depthMeters),
      currentPrice: asString(lot?.price),
      locationReference: lot?.locationReference ?? '',
      notes: lot?.notes ?? '',
      priceChangeReason: '',
    })
    codeEdited.current = false
  }, [lot, open, reset])

  const selectedBlock = blocks.find((block) => block.id === Number(watchedBlockId))
  const generatedCode = selectedBlock && watchedLotNumber.trim()
    ? `${selectedBlock.code}-${watchedLotNumber.trim()}`
    : ''

  useEffect(() => {
    if (mode === 'create' && !codeEdited.current) setValue('code', generatedCode)
  }, [generatedCode, mode, setValue])
  const priceChanged = mode === 'edit' && lot !== null
    ? !sameNumber(lot.price, asNumber(watchedPrice))
    : false

  function submit(values: LotFormValues) {
    if (priceChanged && !values.priceChangeReason?.trim()) {
      setError('priceChangeReason', { type: 'manual', message: 'Ingresa el motivo del cambio de precio' })
      return
    }

    onSubmit({
      blockId: Number(values.blockId),
      lotNumber: values.lotNumber.trim(),
      code: values.code.trim() || null,
      areaM2: asNumber(values.areaM2),
      frontMeters: asNumber(values.frontMeters),
      depthMeters: asNumber(values.depthMeters),
      currentPrice: asNumber(values.currentPrice),
      locationReference: values.locationReference.trim() || null,
      notes: values.notes.trim() || null,
      ...(lot ? { version: lot.version } : {}),
      ...(priceChanged ? { priceChangeReason: values.priceChangeReason?.trim() ?? null } : {}),
    })
  }

  return (
    <Dialog open={open} onClose={pending ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === 'create' ? 'Registrar lote' : `Editar ${lot?.code ?? 'lote'}`}</DialogTitle>
      <DialogContent dividers>
        <Stack component="form" id="lot-form" spacing={2} sx={{ pt: 1 }} onSubmit={handleSubmit(submit)}>
          <TextField
            select
            label="Manzana"
            disabled={pending || isSold}
            error={Boolean(errors.blockId)}
            helperText={errors.blockId?.message}
            {...register('blockId')}
          >
            <MenuItem value="">Selecciona una manzana</MenuItem>
            {blocks.map((block) => (
              <MenuItem key={block.id} value={block.id}>
                {block.code}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Número"
              disabled={pending || isSold}
              error={Boolean(errors.lotNumber)}
              helperText={errors.lotNumber?.message}
              {...register('lotNumber')}
            />
          <TextField
            label="Código"
            value={watchedCode}
            error={Boolean(errors.code)}
            helperText={errors.code?.message}
            {...codeRegistration}
            onChange={(event) => { codeEdited.current = true; void codeRegistration.onChange(event) }}
          />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Superficie (m²)" inputMode="decimal" disabled={pending || isSold} error={Boolean(errors.areaM2)} helperText={errors.areaM2?.message} {...register('areaM2')} />
            <TextField label="Frente (m)" inputMode="decimal" disabled={pending || isSold} error={Boolean(errors.frontMeters)} helperText={errors.frontMeters?.message} {...register('frontMeters')} />
            <TextField label="Fondo (m)" inputMode="decimal" disabled={pending || isSold} error={Boolean(errors.depthMeters)} helperText={errors.depthMeters?.message} {...register('depthMeters')} />
          </Stack>
          <TextField label="Precio" inputMode="decimal" disabled={pending || isSold} error={Boolean(errors.currentPrice)} helperText={errors.currentPrice?.message} {...register('currentPrice')} />
          {priceChanged ? (
            <TextField
              label="Motivo del cambio de precio"
              required
              disabled={pending}
              error={Boolean(errors.priceChangeReason)}
              helperText={errors.priceChangeReason?.message}
              {...register('priceChangeReason')}
            />
          ) : null}
          <TextField label="Referencia de ubicación" multiline minRows={2} disabled={pending} error={Boolean(errors.locationReference)} helperText={errors.locationReference?.message} {...register('locationReference')} />
          <TextField label="Observaciones" multiline minRows={3} disabled={pending} error={Boolean(errors.notes)} helperText={errors.notes?.message} {...register('notes')} />
          {isSold ? <FormHelperText>Los lotes vendidos solo permiten editar referencia y observaciones.</FormHelperText> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={pending}>Cancelar</Button>
        <Button type="submit" form="lot-form" variant="contained" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
