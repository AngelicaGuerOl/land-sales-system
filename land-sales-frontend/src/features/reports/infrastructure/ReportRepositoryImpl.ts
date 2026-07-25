import { httpClient } from '../../../shared/api/httpClient'
import type { ReportSummary } from '../domain/entities/ReportSummary'
import type { ReportRepository } from '../domain/repositories/ReportRepository'

export class ReportRepositoryImpl implements ReportRepository {
  getSummary(dateFrom: string, dateTo: string) {
    const params = new URLSearchParams({ dateFrom, dateTo })
    return httpClient.get<ReportSummary>(`/reports/summary?${params.toString()}`)
  }
}
