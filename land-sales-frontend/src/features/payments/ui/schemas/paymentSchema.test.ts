import { describe, expect, it } from 'vitest'
import { paymentSchema } from './paymentSchema'

describe('paymentSchema', () => {
  it('accepts cash payments without reference', () => {
    expect(paymentSchema.safeParse({ paymentMethod: 'CASH', reference: null }).success).toBe(true)
  })

  it('accepts transfer payments with reference', () => {
    expect(paymentSchema.safeParse({ paymentMethod: 'TRANSFER', reference: 'TR-12345' }).success).toBe(true)
  })

  it('rejects unsupported payment methods', () => {
    const result = paymentSchema.safeParse({ paymentMethod: 'CARD', reference: null })

    expect(result.success).toBe(false)
  })

  it('rejects references longer than 100 characters', () => {
    const result = paymentSchema.safeParse({ paymentMethod: 'TRANSFER', reference: 'A'.repeat(101) })

    expect(result.success).toBe(false)
  })
})
