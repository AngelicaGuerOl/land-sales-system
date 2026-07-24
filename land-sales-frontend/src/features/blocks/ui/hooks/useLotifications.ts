import { useQuery } from '@tanstack/react-query'
import { blockDependencies } from '../../dependencies'

export function useLotifications() {
  return useQuery({ queryKey: ['lotifications'], queryFn: () => blockDependencies.getLotificationsUseCase.execute() })
}
