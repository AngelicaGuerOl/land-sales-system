import { httpClient } from '../../../shared/api/httpClient'
import type { BlockFormInput, BulkLotInput, BulkLotResult } from '../domain/entities/LandBlock'
import type { LandBlock } from '../domain/entities/LandBlock'
import type { BlockRepository } from '../domain/repositories/BlockRepository'
import { BlockMapper, type BlockDto, type LotificationDto } from './mappers/BlockMapper'

export class BlockRepositoryImpl implements BlockRepository {
  async getLotifications() {
    const response = await httpClient.get<LotificationDto[]>('/lotifications')
    return response.map(BlockMapper.toLotification)
  }

  async getBlocks(lotificationId: number): Promise<LandBlock[]> {
    const response = await httpClient.get<BlockDto[]>(`/blocks?lotificationId=${lotificationId}`)
    return response.map(BlockMapper.toBlock)
  }

  async createBlock(input: BlockFormInput) {
    const response = await httpClient.post<BlockDto>('/blocks', input)
    return BlockMapper.toBlock(response)
  }

  async updateBlock(id: number, input: BlockFormInput) {
    const response = await httpClient.put<BlockDto>(`/blocks/${id}`, input)
    return BlockMapper.toBlock(response)
  }

  async deleteBlock(id: number) {
    await httpClient.delete(`/blocks/${id}`)
  }

  async generateLots(blockId: number, input: BulkLotInput): Promise<BulkLotResult> {
    return httpClient.post<BulkLotResult>(`/blocks/${blockId}/lots/bulk`, input)
  }
}
