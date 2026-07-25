import { CreateSaleUseCase } from './application/useCases/CreateSaleUseCase'
import { GetSaleUseCase } from './application/useCases/GetSaleUseCase'
import { GetSalesUseCase } from './application/useCases/GetSalesUseCase'
import { SaleRepositoryImpl } from './infrastructure/SaleRepositoryImpl'

const repository = new SaleRepositoryImpl()
export const saleDependencies = {
  repository,
  createSaleUseCase: new CreateSaleUseCase(repository),
  getSaleUseCase: new GetSaleUseCase(repository),
  getSalesUseCase: new GetSalesUseCase(repository),
}
