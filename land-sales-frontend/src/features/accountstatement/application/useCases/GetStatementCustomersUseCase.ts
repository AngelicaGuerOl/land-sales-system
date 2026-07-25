import type { AccountStatementRepository, StatementQuery } from '../../domain/repositories/AccountStatementRepository'
export class GetStatementCustomersUseCase { private readonly repository: AccountStatementRepository; constructor(repository: AccountStatementRepository) { this.repository = repository } execute(query: StatementQuery) { return this.repository.findCustomers(query) } }
