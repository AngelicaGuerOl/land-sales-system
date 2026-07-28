import { describe, expect, it } from 'vitest'
import { loginSchema } from './loginSchema'

describe('loginSchema', () => {
  it('accepts valid credentials and trims the username', () => {
    const result = loginSchema.safeParse({
      username: ' admin ',
      password: 'secret',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({
        username: 'admin',
        password: 'secret',
      })
    }
  })

  it('rejects an empty username', () => {
    const result = loginSchema.safeParse({
      username: '   ',
      password: 'secret',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ message: 'Ingresa el usuario' }),
      )
    }
  })

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({
      username: 'admin',
      password: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ message: 'Ingresa la contraseña' }),
      )
    }
  })
})
