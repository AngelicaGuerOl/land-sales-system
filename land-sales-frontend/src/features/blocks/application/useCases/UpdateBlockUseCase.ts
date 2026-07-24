import type { BlockFormInput, LandBlock } from '../../domain/entities/LandBlock'
import type { BlockRepository } from '../../domain/repositories/BlockRepository'

export class UpdateBlockUseCase {
  private readonly repository: BlockRepository

  constructor(repository: BlockRepository) {
    this.repository = repository
  }

  execute(id: number, input: BlockFormInput): Promise<LandBlock> {
    return this.repository.updateBlock(id, input)
  }
}
