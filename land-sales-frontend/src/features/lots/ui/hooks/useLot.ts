import { useQuery } from '@tanstack/react-query'
import { lotDependencies } from '../../dependencies'

export function useLot(id: number | null) {
  return useQuery({
    queryKey: ['lot', id],
    queryFn: () => lotDependencies.getLotUseCase.execute(id as number),
    enabled: id !== null,
  })
}
