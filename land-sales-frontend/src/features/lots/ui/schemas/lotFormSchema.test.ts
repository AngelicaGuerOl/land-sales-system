import { describe, expect, it } from 'vitest'
import { lotFormSchema } from './lotFormSchema'

describe('lotFormSchema', () => {
  it('accepts valid lot form values', () => {
    const result = lotFormSchema.safeParse({
      blockId: '1',
      lotNumber: '12',
      code: 'A-12',
      areaM2: '120.5',
      frontMeters: '8',
      depthMeters: '15',
      currentPrice: '250000',
      locationReference: '',
      notes: '',
      priceChangeReason: '',
    })

    expect(result.success).toBe(true)
  })

  it('rejects a missing block', () => {
    const result = lotFormSchema.safeParse({
      blockId: '',
      lotNumber: '12',
      code: 'A-12',
      areaM2: '',
      frontMeters: '',
      depthMeters: '',
      currentPrice: '',
      locationReference: '',
      notes: '',
      priceChangeReason: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ message: 'Selecciona una manzana' }),
      )
    }
  })

  it('rejects negative decimal values', () => {
    const result = lotFormSchema.safeParse({
      blockId: '1',
      lotNumber: '12',
      code: 'A-12',
      areaM2: '-1',
      frontMeters: '',
      depthMeters: '',
      currentPrice: '',
      locationReference: '',
      notes: '',
      priceChangeReason: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ message: 'No puede ser negativo' }),
      )
    }
  })

  it('rejects non-numeric decimal values', () => {
    const result = lotFormSchema.safeParse({
      blockId: '1',
      lotNumber: '12',
      code: 'A-12',
      areaM2: 'abc',
      frontMeters: '',
      depthMeters: '',
      currentPrice: '',
      locationReference: '',
      notes: '',
      priceChangeReason: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ message: 'Ingresa un número válido' }),
      )
    }
  })
})
