import type { LandBlock } from '../../domain/entities/LandBlock'
import type { Lotification } from '../../../lots/domain/entities/Lotification'

type NumericDto = number | string | null

export type BlockDto = {
  id: number
  lotificationId: number
  lotificationName: string
  code: string
  areaM2: NumericDto
  plannedLotCount: number
  registeredLotCount: number
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type LotificationDto = {
  id: number
  name: string
  description: string | null
  address: string | null
  planStorageKey: string | null
  active: boolean
}

const toNumber = (value: NumericDto) => value === null ? null : Number(value)

export const BlockMapper = {
  toBlock(dto: BlockDto): LandBlock {
    return { ...dto, areaM2: toNumber(dto.areaM2) }
  },
  toLotification(dto: LotificationDto): Lotification {
    return dto
  },
}
