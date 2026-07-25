import type { SalePage } from '../../domain/entities/Sale'
import type { SaleRepository, SalesQuery } from '../../domain/repositories/SaleRepository'
export class GetSalesUseCase { private readonly repository: SaleRepository; constructor(repository: SaleRepository) { this.repository = repository } execute(query: SalesQuery): Promise<SalePage> { return this.repository.getSales(query) } }
