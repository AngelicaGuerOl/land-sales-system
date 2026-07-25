import { z } from 'zod'
export const paymentSchema = z.object({ paymentMethod: z.enum(['CASH', 'TRANSFER']), reference: z.string().max(100).nullable() })
export type PaymentFormValues = z.infer<typeof paymentSchema>
