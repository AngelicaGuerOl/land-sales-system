import type { PaymentDetail, PaymentInput, PaymentPage } from '../entities/Payment'
export type PaymentQuery = { page: number; size: number; search?: string; paymentMethod?: string; dateFrom?: string; dateTo?: string }
export interface PaymentRepository { create(input: PaymentInput): Promise<PaymentDetail>; find(query: PaymentQuery): Promise<PaymentPage>; get(id: number): Promise<PaymentDetail> }
