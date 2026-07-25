import type { AccountStatement, StatementPage } from '../entities/AccountStatement'
export type StatementQuery = { page: number; size: number; search?: string }
export interface AccountStatementRepository { findCustomers(query: StatementQuery): Promise<StatementPage>; getCustomerStatement(id: number): Promise<AccountStatement> }
