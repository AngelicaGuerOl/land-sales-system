import { useQuery } from '@tanstack/react-query'
import { lotMapDependencies } from '../../dependencies'

export function useLotifications() {
  return useQuery({
    queryKey: ['lotifications'],
    queryFn: () => lotMapDependencies.getLotificationsUseCase.execute(),
  })
}
