import { GetReportSummaryUseCase } from './application/useCases/GetReportSummaryUseCase'
import { ReportRepositoryImpl } from './infrastructure/ReportRepositoryImpl'

const repository = new ReportRepositoryImpl()
export const reportDependencies = { getSummaryUseCase: new GetReportSummaryUseCase(repository) }
