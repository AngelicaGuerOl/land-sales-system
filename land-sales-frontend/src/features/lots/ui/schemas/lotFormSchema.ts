import { z } from 'zod'

const decimalValue = z.string()
  .refine((value) => value === '' || Number.isFinite(Number(value)), 'Ingresa un número válido')
  .refine((value) => value === '' || Number(value) >= 0, 'No puede ser negativo')

export const lotFormSchema = z.object({
  blockId: z.string().min(1, 'Selecciona una manzana'),
  lotNumber: z.string().trim().min(1, 'Ingresa el número del lote').max(50, 'Máximo 50 caracteres'),
  code: z.string().trim().max(100, 'Máximo 100 caracteres'),
  areaM2: decimalValue,
  frontMeters: decimalValue,
  depthMeters: decimalValue,
  currentPrice: decimalValue,
  locationReference: z.string().max(2000, 'Máximo 2,000 caracteres'),
  notes: z.string().max(5000, 'Máximo 5,000 caracteres'),
  priceChangeReason: z.string().max(1000, 'Máximo 1,000 caracteres').optional(),
})

export type LotFormValues = z.infer<typeof lotFormSchema>
