export const lotStatuses = ['AVAILABLE', 'SOLD', 'BLOCKED'] as const

export type LotStatus = (typeof lotStatuses)[number]

export type LotBlockOption = { id: number; code: string }

export type Lot = {
  id: number
  code: string
  blockId: number
  blockCode: string
  lotNumber: string
  areaM2: number | null
  frontMeters: number | null
  depthMeters: number | null
  price: number | null
  status: LotStatus
  locationReference: string | null
  notes: string | null
  version: number
}

export type LotFormInput = {
  blockId: number
  lotNumber: string
  code?: string | null
  areaM2: number | null
  frontMeters: number | null
  depthMeters: number | null
  currentPrice: number | null
  locationReference: string | null
  notes: string | null
  version?: number
  priceChangeReason?: string | null
}

export type LotPriceHistory = {
  id: number
  previousPrice: number | null
  newPrice: number | null
  reason: string
  changedBy: string
  changedAt: string
}
