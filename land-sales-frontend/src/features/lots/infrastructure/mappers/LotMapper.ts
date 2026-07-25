import type { Lot, LotBlockOption, LotPriceHistory, LotStatus } from '../../domain/entities/Lot'
import type { Lotification } from '../../domain/entities/Lotification'

type NumericDto = number | string | null

export type LotificationDto = {
  id: number
  name: string
  description: string | null
  address: string | null
  planStorageKey: string | null
  active: boolean
}

export type BlockDto = {
  id: number
  lotificationId: number | null
  lotificationName: string | null
  code: string
  areaM2: NumericDto
  plannedLotCount: number
  registeredLotCount: number
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type LotDto = {
  id: number
  blockId: number
  blockCode: string
  lotNumber: string
  code: string
  areaM2: NumericDto
  frontMeters: NumericDto
  depthMeters: NumericDto
  price: NumericDto
  status: LotStatus
  locationReference: string | null
  notes: string | null
  version: number
}

export type LotPriceHistoryDto = {
  id: number
  previousPrice: NumericDto
  newPrice: NumericDto
  reason: string
  changedBy: string
  changedAt: string
}

function toNumber(value: NumericDto): number | null {
  return value === null || value === undefined ? null : Number(value)
}

export const LotMapper = {
  toLotification(dto: LotificationDto): Lotification {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      address: dto.address,
      planStorageKey: dto.planStorageKey,
      active: dto.active,
    }
  },
  toBlock(dto: BlockDto): LotBlockOption {
    return { id: dto.id, code: dto.code }
  },
  toLot(dto: LotDto): Lot {
    return {
      id: dto.id,
      blockId: dto.blockId,
      blockCode: dto.blockCode,
      lotNumber: dto.lotNumber,
      code: dto.code,
      areaM2: toNumber(dto.areaM2),
      frontMeters: toNumber(dto.frontMeters),
      depthMeters: toNumber(dto.depthMeters),
      price: toNumber(dto.price),
      status: dto.status,
      locationReference: dto.locationReference,
      notes: dto.notes,
      version: dto.version,
    }
  },
  toPriceHistory(dto: LotPriceHistoryDto): LotPriceHistory {
    return {
      id: dto.id,
      previousPrice: toNumber(dto.previousPrice),
      newPrice: toNumber(dto.newPrice),
      reason: dto.reason,
      changedBy: dto.changedBy,
      changedAt: dto.changedAt,
    }
  },
}
