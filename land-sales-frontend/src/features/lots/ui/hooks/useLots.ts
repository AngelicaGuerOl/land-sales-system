import { useQuery } from '@tanstack/react-query'
import { lotDependencies } from '../../dependencies'
import type { LotQuery } from '../../domain/repositories/LotRepository'

export function useLots(query: LotQuery | null) {
  return useQuery({
    queryKey: ['lots', query],
    queryFn: () => lotDependencies.getLotsUseCase.execute(query as LotQuery),
    enabled: query !== null,
  })
}
