import type { SaleDetail } from '../../domain/entities/Sale'
import type { SaleRepository } from '../../domain/repositories/SaleRepository'
export class GetSaleUseCase { private readonly repository: SaleRepository; constructor(repository: SaleRepository) { this.repository = repository } execute(id: number): Promise<SaleDetail> { return this.repository.getSale(id) } }
