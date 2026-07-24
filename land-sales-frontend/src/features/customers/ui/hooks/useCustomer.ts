import { useQuery } from '@tanstack/react-query'
import { customerDependencies } from '../../dependencies'

export function useCustomer(id: number | null) {
  return useQuery({ queryKey: ['customer', id], queryFn: () => customerDependencies.getCustomerUseCase.execute(id as number), enabled: id !== null })
}
