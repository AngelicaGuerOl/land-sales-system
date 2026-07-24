import type { LotPriceHistory } from '../../domain/entities/Lot'
import type { LotRepository } from '../../domain/repositories/LotRepository'

export class GetLotPriceHistoryUseCase {
  private readonly repository: LotRepository

  constructor(repository: LotRepository) {
    this.repository = repository
  }

  execute(id: number): Promise<LotPriceHistory[]> {
    return this.repository.getPriceHistory(id)
  }
}
