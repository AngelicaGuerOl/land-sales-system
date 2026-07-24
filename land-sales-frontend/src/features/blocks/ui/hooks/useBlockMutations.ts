import { useMutation } from '@tanstack/react-query'
import { blockDependencies } from '../../dependencies'
import type { BlockFormInput } from '../../domain/entities/LandBlock'

export function useBlockMutations() {
  const create = useMutation({ mutationFn: (input: BlockFormInput) => blockDependencies.createBlockUseCase.execute(input) })
  const update = useMutation({ mutationFn: ({ id, input }: { id: number; input: BlockFormInput }) => blockDependencies.updateBlockUseCase.execute(id, input) })
  const remove = useMutation({ mutationFn: (id: number) => blockDependencies.deleteBlockUseCase.execute(id) })
  return { create, update, remove }
}
