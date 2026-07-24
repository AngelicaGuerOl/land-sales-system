export const lotStatuses = ['AVAILABLE', 'SOLD', 'BLOCKED'] as const

export type LotStatus = (typeof lotStatuses)[number]

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
  svgPath: string | null
  labelX: number | null
  labelY: number | null
  rotation: number | null
}
