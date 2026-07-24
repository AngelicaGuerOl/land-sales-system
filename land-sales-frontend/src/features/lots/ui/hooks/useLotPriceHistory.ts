import { useQuery } from '@tanstack/react-query'
import { lotDependencies } from '../../dependencies'

export function useLotPriceHistory(id: number | null) {
  return useQuery({
    queryKey: ['price-history', id],
    queryFn: () => lotDependencies.getLotPriceHistoryUseCase.execute(id as number),
    enabled: id !== null,
  })
}
