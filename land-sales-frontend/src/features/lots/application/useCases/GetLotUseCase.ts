import type { Lot } from '../../domain/entities/Lot'
import type { LotRepository } from '../../domain/repositories/LotRepository'

export class GetLotUseCase {
  private readonly repository: LotRepository

  constructor(repository: LotRepository) {
    this.repository = repository
  }

  execute(id: number): Promise<Lot> {
    return this.repository.getLot(id)
  }
}
