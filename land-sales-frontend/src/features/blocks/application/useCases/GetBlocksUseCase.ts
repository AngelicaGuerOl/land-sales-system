import type { LandBlock } from '../../domain/entities/LandBlock'
import type { BlockRepository } from '../../domain/repositories/BlockRepository'

export class GetBlocksUseCase {
  private readonly repository: BlockRepository

  constructor(repository: BlockRepository) {
    this.repository = repository
  }

  execute(lotificationId?: number): Promise<LandBlock[]> {
    return this.repository.getBlocks(lotificationId)
  }
}
