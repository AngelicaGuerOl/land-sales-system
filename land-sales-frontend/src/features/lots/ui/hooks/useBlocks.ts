import { useQuery } from '@tanstack/react-query'
import { lotDependencies } from '../../dependencies'

export function useBlocks(lotificationId?: number) {
  return useQuery({
    queryKey: ['blocks', lotificationId],
    queryFn: () => lotDependencies.getBlocksUseCase.execute(lotificationId),
    enabled: true,
  })
}
