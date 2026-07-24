import type { BlockFormInput, LandBlock } from '../../domain/entities/LandBlock'
import type { BlockRepository } from '../../domain/repositories/BlockRepository'

export class CreateBlockUseCase {
  private readonly repository: BlockRepository

  constructor(repository: BlockRepository) {
    this.repository = repository
  }

  execute(input: BlockFormInput): Promise<LandBlock> {
    return this.repository.createBlock(input)
  }
}
