import { httpClient } from '../../../shared/api/httpClient'
import type { LotBlockOption } from '../domain/entities/Lot'
import type { Lot, LotFormInput, LotPriceHistory, LotStatus } from '../domain/entities/Lot'
import type { Lotification } from '../domain/entities/Lotification'
import type { LotRepository } from '../domain/repositories/LotRepository'
import type { LotQuery } from '../domain/repositories/LotRepository'
import { LotMapper, type BlockDto, type LotDto, type LotificationDto, type LotPriceHistoryDto } from './mappers/LotMapper'

export class LotRepositoryImpl implements LotRepository {
  async getLotifications(): Promise<Lotification[]> {
    const response = await httpClient.get<LotificationDto[]>('/lotifications')
    return response.map(LotMapper.toLotification)
  }

  async getBlocks(lotificationId: number): Promise<LotBlockOption[]> {
    const response = await httpClient.get<BlockDto[]>(`/blocks?lotificationId=${lotificationId}`)
    return response.map(LotMapper.toBlock)
  }

  async getLots(query: LotQuery): Promise<Lot[]> {
    const params = new URLSearchParams({ lotificationId: String(query.lotificationId) })
    if (query.blockId !== undefined) params.set('blockId', String(query.blockId))
    if (query.status !== undefined) params.set('status', query.status)
    if (query.search?.trim()) params.set('search', query.search.trim())

    const response = await httpClient.get<LotDto[]>(`/lots?${params.toString()}`)
    return response.map(LotMapper.toLot)
  }

  async getLot(id: number): Promise<Lot> {
    const response = await httpClient.get<LotDto>(`/lots/${id}`)
    return LotMapper.toLot(response)
  }

  async createLot(input: LotFormInput): Promise<Lot> {
    const response = await httpClient.post<LotDto>('/lots', toRequest(input))
    return LotMapper.toLot(response)
  }

  async updateLot(id: number, input: LotFormInput): Promise<Lot> {
    const response = await httpClient.put<LotDto>(`/lots/${id}`, toRequest(input))
    return LotMapper.toLot(response)
  }

  async changeLotStatus(id: number, status: LotStatus, version: number): Promise<Lot> {
    const response = await httpClient.patch<LotDto>(`/lots/${id}/status`, { status, version })
    return LotMapper.toLot(response)
  }

  async getPriceHistory(id: number): Promise<LotPriceHistory[]> {
    const response = await httpClient.get<LotPriceHistoryDto[]>(`/lots/${id}/price-history`)
    return response.map(LotMapper.toPriceHistory)
  }
}

function toRequest(input: LotFormInput) {
  return {
    blockId: input.blockId,
    lotNumber: input.lotNumber,
    code: input.code ?? null,
    areaM2: input.areaM2,
    frontMeters: input.frontMeters,
    depthMeters: input.depthMeters,
    currentPrice: input.currentPrice,
    locationReference: input.locationReference,
    notes: input.notes,
    ...(input.version === undefined ? {} : { version: input.version }),
    ...(input.priceChangeReason === undefined ? {} : { priceChangeReason: input.priceChangeReason }),
  }
}
