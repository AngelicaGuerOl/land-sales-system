import { useQuery } from '@tanstack/react-query'
import { lotDependencies } from '../../dependencies'

export function useLotifications() {
  return useQuery({
    queryKey: ['lotifications'],
    queryFn: () => lotDependencies.getLotificationsUseCase.execute(),
  })
}
