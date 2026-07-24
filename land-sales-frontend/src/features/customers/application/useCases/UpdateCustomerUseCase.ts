import type { Customer, CustomerFormInput } from '../../domain/entities/Customer'
import type { CustomerRepository } from '../../domain/repositories/CustomerRepository'

export class UpdateCustomerUseCase {
  private readonly repository: CustomerRepository

  constructor(repository: CustomerRepository) { this.repository = repository }
  execute(id: number, input: CustomerFormInput): Promise<Customer> { return this.repository.updateCustomer(id, input) }
}
