import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Ingresa el usuario'),
  password: z.string().min(1, 'Ingresa la contraseña'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
