import type { Lotification } from '../../domain/entities/Lotification'
type LotificationsReader = { getLotifications(): Promise<Lotification[]> }

export class GetLotificationsUseCase {
  private readonly lotMapRepository: LotificationsReader

  constructor(lotMapRepository: LotificationsReader) {
    this.lotMapRepository = lotMapRepository
  }

  execute(): Promise<Lotification[]> {
    return this.lotMapRepository.getLotifications()
  }
}
