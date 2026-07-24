import type { Lotification } from '../entities/Lotification'
import type { LotBlockOption } from '../entities/Lot'
import type { Lot, LotFormInput, LotPriceHistory, LotStatus } from '../entities/Lot'

export type LotQuery = {
  lotificationId: number
  blockId?: number
  status?: LotStatus
  search?: string
}

export interface LotRepository {
  getLotifications(): Promise<Lotification[]>
  getBlocks(lotificationId: number): Promise<LotBlockOption[]>
  getLots(query: LotQuery): Promise<Lot[]>
  getLot(id: number): Promise<Lot>
  createLot(input: LotFormInput): Promise<Lot>
  updateLot(id: number, input: LotFormInput): Promise<Lot>
  changeLotStatus(id: number, status: LotStatus, version: number): Promise<Lot>
  getPriceHistory(id: number): Promise<LotPriceHistory[]>
}
