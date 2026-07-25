import type { ReportSummary } from '../entities/ReportSummary'

export interface ReportRepository {
  getSummary(dateFrom: string, dateTo: string): Promise<ReportSummary>
}
