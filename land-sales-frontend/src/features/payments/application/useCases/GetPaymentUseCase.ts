import type { PaymentRepository } from '../../domain/repositories/PaymentRepository'
export class GetPaymentUseCase { private readonly repository: PaymentRepository; constructor(repository: PaymentRepository) { this.repository = repository } execute(id: number) { return this.repository.get(id) } }
