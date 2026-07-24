import { useMutation } from '@tanstack/react-query'
import { blockDependencies } from '../../dependencies'
import type { BulkLotInput } from '../../domain/entities/LandBlock'

export function useBulkLotMutation() {
  return useMutation({
    mutationFn: ({ blockId, input }: { blockId: number; input: BulkLotInput }) =>
      blockDependencies.generateLotsUseCase.execute(blockId, input),
  })
}
