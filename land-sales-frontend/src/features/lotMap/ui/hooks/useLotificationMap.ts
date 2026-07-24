import { useQuery } from '@tanstack/react-query'
import { lotMapDependencies } from '../../dependencies'

export function useLotificationMap(lotificationId: number | null) {
  return useQuery({
    queryKey: ['lotification-map', lotificationId],
    queryFn: () => lotMapDependencies.getLotificationMapUseCase.execute(lotificationId as number),
    enabled: lotificationId !== null,
  })
}
