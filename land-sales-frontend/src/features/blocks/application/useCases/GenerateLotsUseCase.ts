import type { BulkLotInput, BulkLotResult } from '../../domain/entities/LandBlock'
import type { BlockRepository } from '../../domain/repositories/BlockRepository'

export class GenerateLotsUseCase {
  private readonly repository: BlockRepository

  constructor(repository: BlockRepository) {
    this.repository = repository
  }

  execute(blockId: number, input: BulkLotInput): Promise<BulkLotResult> {
    return this.repository.generateLots(blockId, input)
  }
}
