import type { BlockRepository } from '../../domain/repositories/BlockRepository'

export class DeleteBlockUseCase {
  private readonly repository: BlockRepository

  constructor(repository: BlockRepository) {
    this.repository = repository
  }

  execute(id: number): Promise<void> {
    return this.repository.deleteBlock(id)
  }
}
