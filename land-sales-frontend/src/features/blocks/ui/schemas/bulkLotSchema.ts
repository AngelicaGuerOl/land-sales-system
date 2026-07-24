import { z } from 'zod'

const numericValue = z.string().refine((value) => value === '' || (Number.isFinite(Number(value)) && Number(value) >= 0), 'Ingresa un número válido no negativo')

export const bulkLotSchema = z.object({
  startNumber: z.string().regex(/^[1-9]\d*$/, 'Debe ser un entero mayor que 0'),
  endNumber: z.string().regex(/^[1-9]\d*$/, 'Debe ser un entero mayor que 0'),
  numberPrefix: z.string().min(1, 'Ingresa un prefijo').max(20, 'Máximo 20 caracteres'),
  numberPadding: z.string().regex(/^\d+$/, 'Ingresa un entero').refine((value) => Number(value) <= 10, 'Máximo 10 dígitos'),
  areaM2: numericValue,
  frontMeters: numericValue,
  depthMeters: numericValue,
  currentPrice: numericValue,
  locationReference: z.string().max(2000, 'Máximo 2,000 caracteres'),
  notes: z.string().max(5000, 'Máximo 5,000 caracteres'),
}).superRefine((values, context) => {
  if (Number(values.endNumber) < Number(values.startNumber)) context.addIssue({ code: 'custom', path: ['endNumber'], message: 'Debe ser mayor o igual al número inicial' })
})

export type BulkLotFormValues = z.infer<typeof bulkLotSchema>
