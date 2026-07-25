import { z } from 'zod'

const saleLotSchema = z.object({
  lotId: z.number(),
  agreedPrice: z.number().positive('El precio acordado debe ser mayor que cero.'),
  downPayment: z.number().min(0, 'El enganche no puede ser negativo.'),
  installmentCount: z.number().int().min(0),
})

export const saleSchema = z.object({
  customerId: z.number().positive('Selecciona un cliente.'),
  saleDate: z.string().min(1, 'La fecha de venta es obligatoria.'),
  lots: z.array(saleLotSchema).min(1, 'Selecciona al menos un lote.'),
}).superRefine((value, context) => {
  value.lots.forEach((lot, index) => {
    if (lot.downPayment > lot.agreedPrice) context.addIssue({ code: 'custom', path: ['lots', index, 'downPayment'], message: 'El enganche no puede superar el precio.' })
    const balance = lot.agreedPrice - lot.downPayment
    if (balance === 0 && lot.installmentCount !== 0) context.addIssue({ code: 'custom', path: ['lots', index], message: 'El pago total no requiere mensualidades.' })
    if (balance > 0 && lot.installmentCount <= 0) context.addIssue({ code: 'custom', path: ['lots', index], message: 'Captura el número de mensualidades.' })
  })
})
export type SaleFormValues = z.infer<typeof saleSchema>
