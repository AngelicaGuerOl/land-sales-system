import type { LandBlock } from './LandBlock'
import type { Lot } from './Lot'

export type MapLotification = {
  id: number
  name: string
  svgViewBox: string | null
}

export type LotificationMap = {
  lotification: MapLotification
  blocks: LandBlock[]
  lots: Lot[]
}
