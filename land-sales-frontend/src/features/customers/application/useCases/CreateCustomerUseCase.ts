import type { Customer, CustomerFormInput } from '../../domain/entities/Customer'
import type { CustomerRepository } from '../../domain/repositories/CustomerRepository'

export class CreateCustomerUseCase {
  private readonly repository: CustomerRepository

  constructor(repository: CustomerRepository) { this.repository = repository }
  execute(input: CustomerFormInput): Promise<Customer> { return this.repository.createCustomer(input) }
}
