import type { Customer } from '../../domain/entities/Customer'
import type { CustomerRepository } from '../../domain/repositories/CustomerRepository'

export class ChangeCustomerStatusUseCase {
  private readonly repository: CustomerRepository

  constructor(repository: CustomerRepository) { this.repository = repository }
  execute(id: number, active: boolean): Promise<Customer> { return this.repository.changeStatus(id, active) }
}
