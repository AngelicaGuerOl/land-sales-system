import { useQuery } from '@tanstack/react-query'
import { saleDependencies } from '../../dependencies'
import type { SalesQuery } from '../../domain/repositories/SaleRepository'
export function useSales(query: SalesQuery) { return useQuery({ queryKey: ['sales', query], queryFn: () => saleDependencies.getSalesUseCase.execute(query) }) }
