import { GetCustomerStatementUseCase } from './application/useCases/GetCustomerStatementUseCase'
import { GetStatementCustomersUseCase } from './application/useCases/GetStatementCustomersUseCase'
import { AccountStatementRepositoryImpl } from './infrastructure/AccountStatementRepositoryImpl'
const repository = new AccountStatementRepositoryImpl()
export const accountStatementDependencies = { getCustomersUseCase: new GetStatementCustomersUseCase(repository), getCustomerUseCase: new GetCustomerStatementUseCase(repository) }
