import type { LandBlock } from '../../domain/entities/LandBlock'
import type { Lot, LotStatus } from '../../domain/entities/Lot'
import type { Lotification } from '../../domain/entities/Lotification'
import type { LotificationMap, MapLotification } from '../../domain/entities/LotificationMap'

type NumericDto = number | string | null

export type LotificationDto = {
  id: number
  name: string
  description: string | null
  address: string | null
  planStorageKey: string | null
  svgViewBox: string | null
  active: boolean
}

type MapLotificationDto = {
  id: number
  name: string
  svgViewBox: string | null
}

type MapBlockDto = {
  id: number
  code: string
  referenceColor: string | null
}

type MapLotDto = {
  id: number
  code: string
  blockId: number
  blockCode: string
  lotNumber: string
  areaM2: NumericDto
  frontMeters: NumericDto
  depthMeters: NumericDto
  price: NumericDto
  status: LotStatus
  svgPath: string | null
  labelX: NumericDto
  labelY: NumericDto
  rotation: NumericDto
}

export type LotificationMapDto = {
  lotification: MapLotificationDto
  blocks: MapBlockDto[]
  lots: MapLotDto[]
}

function toNumber(value: NumericDto): number | null {
  return value === null || value === undefined ? null : Number(value)
}

export const LotMapMapper = {
  toLotification(dto: LotificationDto): Lotification {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      address: dto.address,
      planStorageKey: dto.planStorageKey,
      svgViewBox: dto.svgViewBox,
      active: dto.active,
    }
  },
  toMapLotification(dto: MapLotificationDto): MapLotification {
    return {
      id: dto.id,
      name: dto.name,
      svgViewBox: dto.svgViewBox,
    }
  },
  toBlock(dto: MapBlockDto): LandBlock {
    return {
      id: dto.id,
      code: dto.code,
      referenceColor: dto.referenceColor,
    }
  },
  toLot(dto: MapLotDto): Lot {
    return {
      id: dto.id,
      code: dto.code,
      blockId: dto.blockId,
      blockCode: dto.blockCode,
      lotNumber: dto.lotNumber,
      areaM2: toNumber(dto.areaM2),
      frontMeters: toNumber(dto.frontMeters),
      depthMeters: toNumber(dto.depthMeters),
      price: toNumber(dto.price),
      status: dto.status,
      svgPath: dto.svgPath,
      labelX: toNumber(dto.labelX),
      labelY: toNumber(dto.labelY),
      rotation: toNumber(dto.rotation),
    }
  },
  toLotificationMap(dto: LotificationMapDto): LotificationMap {
    return {
      lotification: LotMapMapper.toMapLotification(dto.lotification),
      blocks: dto.blocks.map(LotMapMapper.toBlock),
      lots: dto.lots.map(LotMapMapper.toLot),
    }
  },
}
