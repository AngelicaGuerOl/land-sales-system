import type { ReportRepository } from '../../domain/repositories/ReportRepository'

export class GetReportSummaryUseCase {
  private readonly repository: ReportRepository

  constructor(repository: ReportRepository) {
    this.repository = repository
  }

  execute(dateFrom: string, dateTo: string) {
    return this.repository.getSummary(dateFrom, dateTo)
  }
}
