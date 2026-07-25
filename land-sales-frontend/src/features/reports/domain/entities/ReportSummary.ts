export type ReportBlockSummary = { blockCode: string; soldLotsCount: number; totalAgreedAmount: number }

export type ReportSummary = {
  dateFrom: string
  dateTo: string
  salesCount: number
  soldLotsCount: number
  totalAgreedAmount: number
  totalDownPayment: number
  totalFinancedAmount: number
  laterPaymentsAmount: number
  totalCollectedAmount: number
  outstandingBalance: number
  byBlock: ReportBlockSummary[]
}
