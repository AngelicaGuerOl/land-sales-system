import { useMutation } from '@tanstack/react-query'
import { lotDependencies } from '../../dependencies'
import type { LotFormInput, LotStatus } from '../../domain/entities/Lot'

export function useLotMutations() {
  const create = useMutation({ mutationFn: (input: LotFormInput) => lotDependencies.createLotUseCase.execute(input) })
  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: LotFormInput }) =>
      lotDependencies.updateLotUseCase.execute(id, input),
  })
  const changeStatus = useMutation({
    mutationFn: ({ id, status, version }: { id: number; status: LotStatus; version: number }) =>
      lotDependencies.changeLotStatusUseCase.execute(id, status, version),
  })

  return { create, update, changeStatus }
}
