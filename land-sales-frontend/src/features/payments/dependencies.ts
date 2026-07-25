import { CreatePaymentUseCase } from './application/useCases/CreatePaymentUseCase'
import { GetPaymentUseCase } from './application/useCases/GetPaymentUseCase'
import { GetPaymentsUseCase } from './application/useCases/GetPaymentsUseCase'
import { PaymentRepositoryImpl } from './infrastructure/PaymentRepositoryImpl'
const repository = new PaymentRepositoryImpl()
export const paymentDependencies = { createUseCase: new CreatePaymentUseCase(repository), getUseCase: new GetPaymentUseCase(repository), getAllUseCase: new GetPaymentsUseCase(repository) }
