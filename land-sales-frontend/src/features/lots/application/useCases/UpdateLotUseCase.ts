import type { Lot, LotFormInput } from '../../domain/entities/Lot'
import type { LotRepository } from '../../domain/repositories/LotRepository'

export class UpdateLotUseCase {
  private readonly repository: LotRepository

  constructor(repository: LotRepository) {
    this.repository = repository
  }

  execute(id: number, input: LotFormInput): Promise<Lot> {
    return this.repository.updateLot(id, input)
  }
}
