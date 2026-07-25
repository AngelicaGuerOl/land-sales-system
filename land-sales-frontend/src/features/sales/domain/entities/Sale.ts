export type SaleStatus = 'ACTIVE' | 'PAID' | 'CANCELLED'

export type SaleLotOption = {
  id: number
  code: string
  blockCode: string
  lotNumber: string
  areaM2: number | null
  frontMeters: number | null
  depthMeters: number | null
  price: number | null
}

export type SaleCustomerOption = { id: number; fullName: string; phone: string; address: string | null }
export type SaleBlockOption = { id: number; code: string }
export type SaleLotInput = { lotId: number; agreedPrice: number; downPayment: number; installmentCount: number }
export type CreateSaleInput = { customerId: number; saleDate: string; lots: SaleLotInput[] }
export type SaleInstallment = { installmentNumber: number; paymentMonth: string; amount: number; paidAmount: number; status: 'PENDING' | 'PARTIAL' | 'PAID' }
export type SaleLotDetail = SaleLotInput & { code: string; blockCode: string; lotNumber: string; areaM2: number | null; frontMeters: number | null; depthMeters: number | null; financedAmount: number; outstandingBalance: number; installmentAmount: number; firstPaymentMonth: string | null; status: 'ACTIVE' | 'PAID' | 'CANCELLED'; installments: SaleInstallment[] }
export type SaleSummary = { id: number; folio: string; saleDate: string; customerId: number; customerName: string; customerPhone: string; lotCount: number; lotCodes: string[]; totalAgreedPrice: number; totalDownPayment: number; totalFinancedAmount: number; status: SaleStatus; createdAt: string }
export type SaleDetail = { id: number; folio: string; saleDate: string; customer: SaleCustomerOption & { alternatePhone: string | null }; createdBy: { id: number; fullName: string; username: string }; totalAgreedPrice: number; totalDownPayment: number; totalFinancedAmount: number; status: SaleStatus; createdAt: string; updatedAt: string; lots: SaleLotDetail[] }
export type SalePage = { content: SaleSummary[]; page: number; size: number; totalElements: number; totalPages: number; first: boolean; last: boolean }
