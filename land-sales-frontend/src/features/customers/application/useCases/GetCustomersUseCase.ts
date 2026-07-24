import type { CustomerPage } from '../../domain/entities/Customer'
import type { CustomerQuery, CustomerRepository } from '../../domain/repositories/CustomerRepository'

export class GetCustomersUseCase {
  private readonly repository: CustomerRepository

  constructor(repository: CustomerRepository) { this.repository = repository }
  execute(query: CustomerQuery): Promise<CustomerPage> { return this.repository.getCustomers(query) }
}
