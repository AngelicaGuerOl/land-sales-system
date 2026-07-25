import { useQuery } from '@tanstack/react-query'
import { reportDependencies } from '../../dependencies'

export function useReportSummary(dateFrom: string, dateTo: string, enabled: boolean) {
  return useQuery({
    queryKey: ['report-summary', dateFrom, dateTo],
    queryFn: () => reportDependencies.getSummaryUseCase.execute(dateFrom, dateTo),
    enabled,
  })
}
