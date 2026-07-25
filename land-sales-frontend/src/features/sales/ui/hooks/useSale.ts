import { useQuery } from '@tanstack/react-query'
import { saleDependencies } from '../../dependencies'
export function useSale(id: number | null) { return useQuery({ queryKey: ['sale', id], queryFn: () => saleDependencies.getSaleUseCase.execute(id as number), enabled: id !== null }) }
