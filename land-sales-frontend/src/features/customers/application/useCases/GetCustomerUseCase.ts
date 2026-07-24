import type { Customer } from '../../domain/entities/Customer'
import type { CustomerRepository } from '../../domain/repositories/CustomerRepository'

export class GetCustomerUseCase {
  private readonly repository: CustomerRepository

  constructor(repository: CustomerRepository) { this.repository = repository }
  execute(id: number): Promise<Customer> { return this.repository.getCustomer(id) }
}
