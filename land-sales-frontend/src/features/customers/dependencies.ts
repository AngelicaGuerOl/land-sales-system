import { ChangeCustomerStatusUseCase } from './application/useCases/ChangeCustomerStatusUseCase'
import { CreateCustomerUseCase } from './application/useCases/CreateCustomerUseCase'
import { GetCustomerUseCase } from './application/useCases/GetCustomerUseCase'
import { GetCustomersUseCase } from './application/useCases/GetCustomersUseCase'
import { UpdateCustomerUseCase } from './application/useCases/UpdateCustomerUseCase'
import { CustomerRepositoryImpl } from './infrastructure/CustomerRepositoryImpl'

const customerRepository = new CustomerRepositoryImpl()

export const customerDependencies = {
  getCustomersUseCase: new GetCustomersUseCase(customerRepository),
  getCustomerUseCase: new GetCustomerUseCase(customerRepository),
  createCustomerUseCase: new CreateCustomerUseCase(customerRepository),
  updateCustomerUseCase: new UpdateCustomerUseCase(customerRepository),
  changeCustomerStatusUseCase: new ChangeCustomerStatusUseCase(customerRepository),
}
