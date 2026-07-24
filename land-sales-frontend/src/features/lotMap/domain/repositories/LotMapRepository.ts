import type { Lotification } from '../entities/Lotification'
import type { LotificationMap } from '../entities/LotificationMap'

export interface LotMapRepository {
  getLotifications(): Promise<Lotification[]>
  getLotificationMap(lotificationId: number): Promise<LotificationMap>
}
