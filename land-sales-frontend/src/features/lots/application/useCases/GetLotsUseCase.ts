import type { Lot } from '../../domain/entities/Lot'
import type { LotRepository, LotQuery } from '../../domain/repositories/LotRepository'

export class GetLotsUseCase {
  private readonly repository: LotRepository

  constructor(repository: LotRepository) {
    this.repository = repository
  }

  execute(query: LotQuery): Promise<Lot[]> {
    return this.repository.getLots(query)
  }
}
