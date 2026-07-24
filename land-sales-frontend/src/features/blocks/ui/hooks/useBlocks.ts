import { useQuery } from '@tanstack/react-query'
import { blockDependencies } from '../../dependencies'

export function useBlocks(lotificationId: number | null) {
  return useQuery({
    queryKey: ['blocks', lotificationId],
    queryFn: () => blockDependencies.getBlocksUseCase.execute(lotificationId as number),
    enabled: lotificationId !== null,
  })
}
