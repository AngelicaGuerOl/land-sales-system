import { useQuery } from '@tanstack/react-query'
import { paymentDependencies } from '../../dependencies'
export function usePayment(id: number | null) { return useQuery({ queryKey: ['payment', id], queryFn: () => paymentDependencies.getUseCase.execute(id as number), enabled: id !== null }) }
