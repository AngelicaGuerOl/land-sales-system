import type { BlockFormInput, BulkLotInput, BulkLotResult, LandBlock } from '../entities/LandBlock'

export interface BlockRepository {
  getLotifications(): Promise<import('../../../lots/domain/entities/Lotification').Lotification[]>
  getBlocks(lotificationId?: number): Promise<LandBlock[]>
  createBlock(input: BlockFormInput): Promise<LandBlock>
  updateBlock(id: number, input: BlockFormInput): Promise<LandBlock>
  deleteBlock(id: number): Promise<void>
  generateLots(blockId: number, input: BulkLotInput): Promise<BulkLotResult>
}
