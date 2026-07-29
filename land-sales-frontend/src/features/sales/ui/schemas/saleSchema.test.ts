import { describe, expect, it } from 'vitest'
import { saleSchema } from './saleSchema'

const validSale = {
  customerId: 1,
  saleDate: '2026-03-10',
  lots: [
    {
      lotId: 101,
      agreedPrice: 250000,
      downPayment: 50000,
      installmentCount: 12,
    },
  ],
}

describe('saleSchema', () => {
  it('accepts a valid financed sale', () => {
    expect(saleSchema.safeParse(validSale).success).toBe(true)
  })

  it('requires a selected customer', () => {
    const result = saleSchema.safeParse({ ...validSale, customerId: 0 })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ message: 'Selecciona un cliente.' }),
      )
    }
  })

  it('requires at least one lot', () => {
    const result = saleSchema.safeParse({ ...validSale, lots: [] })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ message: 'Selecciona al menos un lote.' }),
      )
    }
  })

  it('rejects a down payment greater than the agreed price', () => {
    const result = saleSchema.safeParse({
      ...validSale,
      lots: [{ ...validSale.lots[0], downPayment: 260000 }],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ message: 'El enganche no puede superar el precio.' }),
      )
    }
  })

  it('requires installments when part of the price is financed', () => {
    const result = saleSchema.safeParse({
      ...validSale,
      lots: [{ ...validSale.lots[0], installmentCount: 0 }],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ message: 'Captura el número de mensualidades.' }),
      )
    }
  })

  it('rejects installments when the lot is fully paid upfront', () => {
    const result = saleSchema.safeParse({
      ...validSale,
      lots: [{ ...validSale.lots[0], downPayment: 250000, installmentCount: 12 }],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ message: 'El pago total no requiere mensualidades.' }),
      )
    }
  })
})
