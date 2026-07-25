import { httpClient } from '../../../shared/api/httpClient'
import type { AccountStatement, StatementPage } from '../domain/entities/AccountStatement'
import type { AccountStatementRepository, StatementQuery } from '../domain/repositories/AccountStatementRepository'
export class AccountStatementRepositoryImpl implements AccountStatementRepository {
  findCustomers(query: StatementQuery) { const params = new URLSearchParams({ page: String(query.page), size: String(query.size) }); if (query.search?.trim()) params.set('search', query.search.trim()); return httpClient.get<StatementPage>(`/account-statements/customers?${params}`) }
  getCustomerStatement(id: number) { return httpClient.get<AccountStatement>(`/account-statements/customers/${id}`) }
}
