import { describe, expect, it } from 'vitest'
import { customerFormSchema } from './customerFormSchema'

describe('customerFormSchema', () => {
  it('accepts valid customer data and trims required fields', () => {
    const result = customerFormSchema.safeParse({
      fullName: ' Cliente Prueba ',
      phone: ' 5551234567 ',
      alternatePhone: '',
      address: '',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.fullName).toBe('Cliente Prueba')
      expect(result.data.phone).toBe('5551234567')
    }
  })

  it('rejects an empty full name', () => {
    const result = customerFormSchema.safeParse({
      fullName: ' ',
      phone: '5551234567',
      alternatePhone: '',
      address: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ message: 'El nombre completo es obligatorio.' }),
      )
    }
  })

  it('rejects phone values with unsupported characters', () => {
    const result = customerFormSchema.safeParse({
      fullName: 'Cliente Prueba',
      phone: '555-ABC',
      alternatePhone: '',
      address: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ message: 'Usa números, espacios, +, -, o paréntesis.' }),
      )
    }
  })

  it('rejects phone values with more than ten digits', () => {
    const result = customerFormSchema.safeParse({
      fullName: 'Cliente Prueba',
      phone: '55512345678',
      alternatePhone: '',
      address: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ message: 'El teléfono no puede tener más de 10 dígitos.' }),
      )
    }
  })
})
