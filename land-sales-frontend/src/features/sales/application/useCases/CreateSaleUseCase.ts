import type { CreateSaleInput, SaleDetail } from '../../domain/entities/Sale'
import type { SaleRepository } from '../../domain/repositories/SaleRepository'
export class CreateSaleUseCase { private readonly repository: SaleRepository; constructor(repository: SaleRepository) { this.repository = repository } execute(input: CreateSaleInput): Promise<SaleDetail> { return this.repository.create(input) } }
