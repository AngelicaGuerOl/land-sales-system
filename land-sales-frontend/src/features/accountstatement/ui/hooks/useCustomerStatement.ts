import { useQuery } from '@tanstack/react-query'
import { accountStatementDependencies } from '../../dependencies'
export function useCustomerStatement(id: number | null) { return useQuery({ queryKey: ['customer-statement', id], queryFn: () => accountStatementDependencies.getCustomerUseCase.execute(id as number), enabled: id !== null }) }
