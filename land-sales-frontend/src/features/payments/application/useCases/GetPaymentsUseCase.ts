import type { PaymentRepository, PaymentQuery } from '../../domain/repositories/PaymentRepository'
export class GetPaymentsUseCase { private readonly repository: PaymentRepository; constructor(repository: PaymentRepository) { this.repository = repository } execute(query: PaymentQuery) { return this.repository.find(query) } }
