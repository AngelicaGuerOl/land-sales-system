import type { AccountStatementRepository } from '../../domain/repositories/AccountStatementRepository'
export class GetCustomerStatementUseCase { private readonly repository: AccountStatementRepository; constructor(repository: AccountStatementRepository) { this.repository = repository } execute(id: number) { return this.repository.getCustomerStatement(id) } }
