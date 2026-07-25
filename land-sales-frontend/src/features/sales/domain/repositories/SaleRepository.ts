import type { CreateSaleInput, SaleBlockOption, SaleCustomerOption, SaleDetail, SaleLotOption, SalePage } from '../entities/Sale'

export type SalesQuery = { page: number; size: number; search?: string; status?: string; dateFrom?: string; dateTo?: string }
export interface SaleRepository {
  getCustomers(search: string): Promise<SaleCustomerOption[]>
  getBlocks(lotificationId: number): Promise<SaleBlockOption[]>
  getLotifications(): Promise<{ id: number; name: string; active: boolean }[]>
  getAvailableLots(lotificationId: number, blockId?: number, search?: string): Promise<SaleLotOption[]>
  create(input: CreateSaleInput): Promise<SaleDetail>
  getSales(query: SalesQuery): Promise<SalePage>
  getSale(id: number): Promise<SaleDetail>
}
