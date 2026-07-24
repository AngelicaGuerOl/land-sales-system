import { useQuery } from '@tanstack/react-query'
import type { CustomerQuery } from '../../domain/repositories/CustomerRepository'
import { customerDependencies } from '../../dependencies'

export function useCustomers(query: CustomerQuery) {
  return useQuery({ queryKey: ['customers', query], queryFn: () => customerDependencies.getCustomersUseCase.execute(query) })
}
