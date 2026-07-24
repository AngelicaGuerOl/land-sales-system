import { z } from 'zod'

export const blockFormSchema = z.object({
  lotificationId: z.string().min(1, 'Selecciona una lotificación'),
  code: z.string().trim().min(1, 'Ingresa el código').max(50, 'Máximo 50 caracteres'),
  areaM2: z.string().refine((value) => value === '' || (Number.isFinite(Number(value)) && Number(value) >= 0), 'Ingresa una superficie válida'),
  plannedLotCount: z.string().regex(/^\d+$/, 'Ingresa un entero no negativo'),
})

export type BlockFormValues = z.infer<typeof blockFormSchema>
