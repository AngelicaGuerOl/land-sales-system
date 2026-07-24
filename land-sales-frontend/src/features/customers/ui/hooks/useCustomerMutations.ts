import { useMutation } from '@tanstack/react-query'
import type { CustomerFormInput } from '../../domain/entities/Customer'
import { customerDependencies } from '../../dependencies'

export function useCustomerMutations() {
  const create = useMutation({ mutationFn: (input: CustomerFormInput) => customerDependencies.createCustomerUseCase.execute(input) })
  const update = useMutation({ mutationFn: ({ id, input }: { id: number; input: CustomerFormInput }) => customerDependencies.updateCustomerUseCase.execute(id, input) })
  const changeStatus = useMutation({ mutationFn: ({ id, active }: { id: number; active: boolean }) => customerDependencies.changeCustomerStatusUseCase.execute(id, active) })
  return { create, update, changeStatus }
}
