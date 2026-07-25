import { useQuery } from '@tanstack/react-query'
import { accountStatementDependencies } from '../../dependencies'
export function useStatementCustomers(query: { page: number; size: number; search: string }) { return useQuery({ queryKey: ['account-statement-customers', query], queryFn: () => accountStatementDependencies.getCustomersUseCase.execute(query) }) }
