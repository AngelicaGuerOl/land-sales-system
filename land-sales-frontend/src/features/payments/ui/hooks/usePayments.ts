import { useQuery } from '@tanstack/react-query'
import { paymentDependencies } from '../../dependencies'
export function usePayments(query: { page: number; size: number; search: string; paymentMethod: string; dateFrom: string; dateTo: string }) { return useQuery({ queryKey: ['payments', query], queryFn: () => paymentDependencies.getAllUseCase.execute(query) }) }
