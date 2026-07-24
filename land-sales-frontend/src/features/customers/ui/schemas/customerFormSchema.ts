import { z } from 'zod'

const phonePattern = /^[0-9+()\-\s]+$/
const hasAtMostTenDigits = (value: string) => (value.match(/\d/g) ?? []).length <= 10

export const customerFormSchema = z.object({
  fullName: z.string().trim().min(1, 'El nombre completo es obligatorio.').max(150, 'Máximo 150 caracteres.'),
  phone: z.string().trim().min(1, 'El teléfono principal es obligatorio.').max(20, 'Máximo 20 caracteres.').regex(phonePattern, 'Usa números, espacios, +, -, o paréntesis.').refine(hasAtMostTenDigits, 'El teléfono no puede tener más de 10 dígitos.'),
  alternatePhone: z.string().max(20, 'Máximo 20 caracteres.').refine((value) => value.trim() === '' || phonePattern.test(value), 'Usa números, espacios, +, -, o paréntesis.').refine(hasAtMostTenDigits, 'El teléfono no puede tener más de 10 dígitos.'),
  address: z.string().max(500, 'Máximo 500 caracteres.'),
})

export type CustomerFormValues = z.infer<typeof customerFormSchema>
