import type { LotBlockOption } from '../../domain/entities/Lot'
type BlocksReader = { getBlocks(lotificationId: number): Promise<LotBlockOption[]> }

export class GetBlocksUseCase {
  private readonly lotMapRepository: BlocksReader

  constructor(lotMapRepository: BlocksReader) {
    this.lotMapRepository = lotMapRepository
  }

  execute(lotificationId: number): Promise<LotBlockOption[]> {
    return this.lotMapRepository.getBlocks(lotificationId)
  }
}
