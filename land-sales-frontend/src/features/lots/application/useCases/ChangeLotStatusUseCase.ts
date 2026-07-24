import type { Lot, LotStatus } from '../../domain/entities/Lot'
import type { LotRepository } from '../../domain/repositories/LotRepository'

export class ChangeLotStatusUseCase {
  private readonly repository: LotRepository

  constructor(repository: LotRepository) {
    this.repository = repository
  }

  execute(id: number, status: LotStatus, version: number): Promise<Lot> {
    return this.repository.changeLotStatus(id, status, version)
  }
}
