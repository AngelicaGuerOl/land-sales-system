import type { Lotification } from '../../domain/entities/Lotification'
import type { LotMapRepository } from '../../domain/repositories/LotMapRepository'

export class GetLotificationsUseCase {
  private readonly lotMapRepository: LotMapRepository

  constructor(lotMapRepository: LotMapRepository) {
    this.lotMapRepository = lotMapRepository
  }

  execute(): Promise<Lotification[]> {
    return this.lotMapRepository.getLotifications()
  }
}
