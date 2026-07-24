import { useQuery } from '@tanstack/react-query'
import { lotDependencies } from '../../dependencies'

export function useBlocks(lotificationId: number | null) {
  return useQuery({
    queryKey: ['blocks', lotificationId],
    queryFn: () => lotDependencies.getBlocksUseCase.execute(lotificationId as number),
    enabled: lotificationId !== null,
  })
}
