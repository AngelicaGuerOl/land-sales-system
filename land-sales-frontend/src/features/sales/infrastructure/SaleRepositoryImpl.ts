import { httpClient } from '../../../shared/api/httpClient'
import type { CreateSaleInput, SaleCustomerOption, SaleDetail, SalePage } from '../domain/entities/Sale'
import type { SaleRepository, SalesQuery } from '../domain/repositories/SaleRepository'

type LotificationDto = { id: number; name: string; active: boolean }
type BlockDto = { id: number; code: string }
type LotDto = { id: number; code: string; blockCode: string; lotNumber: string; areaM2: number | null; frontMeters: number | null; depthMeters: number | null; price: number | null; status: string }
type CustomerPageDto = { content: SaleCustomerOption[] }

export class SaleRepositoryImpl implements SaleRepository {
  async getCustomers(search: string) { const params = new URLSearchParams({ page: '0', size: '20', active: 'true' }); if (search.trim()) params.set('search', search.trim()); const page = await httpClient.get<CustomerPageDto>(`/customers?${params}`); return page.content }
  async getLotifications() { return httpClient.get<LotificationDto[]>('/lotifications') }
  async getBlocks(lotificationId?: number) {
    const params = new URLSearchParams()
    if (lotificationId !== undefined) params.set('lotificationId', String(lotificationId))
    const query = params.toString()
    return httpClient.get<BlockDto[]>(query ? `/blocks?${query}` : '/blocks')
  }
  async getAvailableLots(lotificationId?: number, blockId?: number, search?: string) {
    const params = new URLSearchParams({ status: 'AVAILABLE' })
    if (lotificationId !== undefined) params.set('lotificationId', String(lotificationId))
    if (blockId !== undefined) params.set('blockId', String(blockId))
    if (search?.trim()) params.set('search', search.trim())
    const lots = await httpClient.get<LotDto[]>(`/lots?${params}`)
    return lots.map(({ id, code, blockCode, lotNumber, areaM2, frontMeters, depthMeters, price }) => ({ id, code, blockCode, lotNumber, areaM2, frontMeters, depthMeters, price }))
  }
  create(input: CreateSaleInput) { return httpClient.post<SaleDetail>('/sales', input) }
  async getSales(query: SalesQuery) { const params = new URLSearchParams({ page: String(query.page), size: String(query.size) }); if (query.search?.trim()) params.set('search', query.search.trim()); if (query.status) params.set('status', query.status); if (query.dateFrom) params.set('dateFrom', query.dateFrom); if (query.dateTo) params.set('dateTo', query.dateTo); return httpClient.get<SalePage>(`/sales?${params}`) }
  getSale(id: number) { return httpClient.get<SaleDetail>(`/sales/${id}`) }
}
