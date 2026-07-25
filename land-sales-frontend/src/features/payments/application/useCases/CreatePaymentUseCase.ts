import type { PaymentInput } from '../../domain/entities/Payment'
import type { PaymentRepository } from '../../domain/repositories/PaymentRepository'
export class CreatePaymentUseCase { private readonly repository: PaymentRepository; constructor(repository: PaymentRepository) { this.repository = repository } execute(input: PaymentInput) { return this.repository.create(input) } }
