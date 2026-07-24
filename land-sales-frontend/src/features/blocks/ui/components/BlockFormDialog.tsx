import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormHelperText, Stack, TextField } from '@mui/material'
import { useState, type FormEvent } from 'react'
import type { BlockFormInput, LandBlock } from '../../domain/entities/LandBlock'
import { blockFormSchema } from '../schemas/blockFormSchema'

type Props = { open: boolean; block: LandBlock | null; defaultLotificationId: number | null; pending: boolean; onClose(): void; onSubmit(input: BlockFormInput): void }
type Values = { lotificationId: string; code: string; areaM2: string; plannedLotCount: string }

export function BlockFormDialog({ open, block, defaultLotificationId, pending, onClose, onSubmit }: Props) {
  const [values, setValues] = useState<Values>(() => ({ lotificationId: String(block?.lotificationId ?? defaultLotificationId ?? ''), code: block?.code ?? '', areaM2: block?.areaM2 === null || block?.areaM2 === undefined ? '' : String(block.areaM2), plannedLotCount: String(block?.plannedLotCount ?? 0) }))
  const hasLots = (block?.registeredLotCount ?? 0) > 0
  const set = (key: keyof Values, value: string) => setValues((current) => ({ ...current, [key]: value }))
  const valid = blockFormSchema.safeParse(values).success
  function submit(event: FormEvent) { event.preventDefault(); if (!valid) return; onSubmit({ lotificationId: Number(values.lotificationId), code: values.code.trim(), areaM2: values.areaM2.trim() === '' ? null : Number(values.areaM2), plannedLotCount: Number(values.plannedLotCount), notes: block?.notes ?? null }) }
  return <Dialog open={open} onClose={pending ? undefined : onClose} fullWidth maxWidth="sm"><DialogTitle>{block ? `Editar ${block.code}` : 'Registrar manzana'}</DialogTitle><DialogContent dividers><Stack component="form" id="block-form" onSubmit={submit} spacing={2} sx={{ pt: 1 }}><TextField label="Código" value={values.code} disabled={pending || hasLots} onChange={(event) => set('code', event.target.value.toUpperCase())} required /><TextField label="Superficie (m²)" value={values.areaM2} type="number" slotProps={{ htmlInput: { min: 0, step: '0.01' } }} disabled={pending} onChange={(event) => set('areaM2', event.target.value)} /><TextField label="Lotes planeados" value={values.plannedLotCount} type="number" slotProps={{ htmlInput: { min: 0, step: 1 } }} disabled={pending} onChange={(event) => set('plannedLotCount', event.target.value)} required />{hasLots ? <FormHelperText>Esta manzana tiene lotes registrados; el código no se puede cambiar.</FormHelperText> : null}</Stack></DialogContent><DialogActions><Button onClick={onClose} disabled={pending}>Cancelar</Button><Button type="submit" form="block-form" variant="contained" disabled={pending || !valid}>{pending ? 'Guardando...' : 'Guardar'}</Button></DialogActions></Dialog>
}
