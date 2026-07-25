import { httpClient } from '../../../shared/api/httpClient'
import type { PaymentDetail, PaymentInput, PaymentPage } from '../domain/entities/Payment'
import type { PaymentRepository, PaymentQuery } from '../domain/repositories/PaymentRepository'
export class PaymentRepositoryImpl implements PaymentRepository {
  create(input: PaymentInput) { return httpClient.post<PaymentDetail>('/payments', input) }
  find(query: PaymentQuery) { const params = new URLSearchParams({ page: String(query.page), size: String(query.size) }); if (query.search?.trim()) params.set('search', query.search.trim()); if (query.paymentMethod) params.set('paymentMethod', query.paymentMethod); if (query.dateFrom) params.set('dateFrom', query.dateFrom); if (query.dateTo) params.set('dateTo', query.dateTo); return httpClient.get<PaymentPage>(`/payments?${params}`) }
  get(id: number) { return httpClient.get<PaymentDetail>(`/payments/${id}`) }
}
