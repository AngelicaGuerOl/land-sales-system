export type LandBlock = {
  id: number
  lotificationId: number
  lotificationName: string
  code: string
  areaM2: number | null
  plannedLotCount: number
  registeredLotCount: number
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type BlockFormInput = {
  lotificationId: number
  code: string
  areaM2: number | null
  plannedLotCount: number
  notes: string | null
}

export type BulkLotInput = {
  startNumber: number
  endNumber: number
  numberPrefix: string
  numberPadding: number
  areaM2: number | null
  frontMeters: number | null
  depthMeters: number | null
  currentPrice: number | null
  locationReference: string | null
  notes: string | null
}

export type BulkLotResult = {
  blockId: number
  blockCode: string
  requestedCount: number
  createdCount: number
  createdLots: import('../../../lots/domain/entities/Lot').Lot[]
}
