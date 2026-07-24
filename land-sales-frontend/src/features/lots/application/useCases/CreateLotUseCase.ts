import type { Lot, LotFormInput } from '../../domain/entities/Lot'
import type { LotRepository } from '../../domain/repositories/LotRepository'

export class CreateLotUseCase {
  private readonly repository: LotRepository

  constructor(repository: LotRepository) {
    this.repository = repository
  }

  execute(input: LotFormInput): Promise<Lot> {
    return this.repository.createLot(input)
  }
}
