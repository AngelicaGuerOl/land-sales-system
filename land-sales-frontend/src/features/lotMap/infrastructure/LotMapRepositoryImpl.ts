import { httpClient } from '../../../shared/api/httpClient'
import type { Lotification } from '../domain/entities/Lotification'
import type { LotificationMap } from '../domain/entities/LotificationMap'
import type { LotMapRepository } from '../domain/repositories/LotMapRepository'
import { LotMapMapper, type LotificationDto, type LotificationMapDto } from './mappers/LotMapMapper'

export class LotMapRepositoryImpl implements LotMapRepository {
  async getLotifications(): Promise<Lotification[]> {
    const response = await httpClient.get<LotificationDto[]>('/lotifications')
    return response.map(LotMapMapper.toLotification)
  }

  async getLotificationMap(lotificationId: number): Promise<LotificationMap> {
    const response = await httpClient.get<LotificationMapDto>(`/lotifications/${lotificationId}/map`)
    return LotMapMapper.toLotificationMap(response)
  }
}
