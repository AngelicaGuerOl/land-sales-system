import type { LotificationMap } from '../../domain/entities/LotificationMap'
import type { LotMapRepository } from '../../domain/repositories/LotMapRepository'

export class GetLotificationMapUseCase {
  private readonly lotMapRepository: LotMapRepository

  constructor(lotMapRepository: LotMapRepository) {
    this.lotMapRepository = lotMapRepository
  }

  execute(lotificationId: number): Promise<LotificationMap> {
    return this.lotMapRepository.getLotificationMap(lotificationId)
  }
}
