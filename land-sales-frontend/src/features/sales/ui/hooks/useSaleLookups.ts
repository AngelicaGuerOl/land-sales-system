import { useQuery } from '@tanstack/react-query'
import { saleDependencies } from '../../dependencies'
export function useSaleCustomers(search: string) { return useQuery({ queryKey: ['sale-customers', search], queryFn: () => saleDependencies.repository.getCustomers(search), enabled: search.trim().length > 1 }) }
export function useSaleLotifications() { return useQuery({ queryKey: ['sale-lotifications'], queryFn: () => saleDependencies.repository.getLotifications() }) }
export function useSaleBlocks(id: number | null) { return useQuery({ queryKey: ['sale-blocks', id], queryFn: () => saleDependencies.repository.getBlocks(id as number), enabled: id !== null }) }
export function useAvailableLots(lotificationId: number | null, blockId: number | undefined, search: string) { return useQuery({ queryKey: ['sale-available-lots', lotificationId, blockId, search], queryFn: () => saleDependencies.repository.getAvailableLots(lotificationId as number, blockId, search), enabled: lotificationId !== null }) }
