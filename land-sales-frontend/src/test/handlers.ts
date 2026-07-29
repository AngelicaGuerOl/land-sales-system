import { http, HttpResponse } from 'msw'
import type { RequestHandler } from 'msw'
import type { CustomerDto, CustomerPageDto } from '../features/customers/infrastructure/mappers/CustomerMapper'

export const handlers: RequestHandler[] = []

export const customerFixtures = {
  active: {
    id: 1,
    fullName: 'Ana Lopez',
    phone: '5551234567',
    alternatePhone: null,
    address: 'Calle Norte 100',
    active: true,
    createdAt: '2026-01-10T10:00:00',
    updatedAt: '2026-01-10T10:00:00',
  },
  inactive: {
    id: 2,
    fullName: 'Bruno Perez',
    phone: '5557654321',
    alternatePhone: '5551112222',
    address: null,
    active: false,
    createdAt: '2026-01-11T11:00:00',
    updatedAt: '2026-01-11T11:00:00',
  },
} satisfies Record<string, CustomerDto>

export function createCustomerPage(
  content: CustomerDto[] = [customerFixtures.active, customerFixtures.inactive],
  overrides: Partial<Omit<CustomerPageDto, 'content'>> = {},
): CustomerPageDto {
  return {
    content,
    page: 0,
    size: 25,
    totalElements: content.length,
    totalPages: content.length > 0 ? 1 : 0,
    first: true,
    last: true,
    ...overrides,
  }
}

export const customerHandlers = {
  getCustomersSuccess(page: CustomerPageDto = createCustomerPage()) {
    return http.get('/api/customers', () => HttpResponse.json(page))
  },
  getCustomersEmpty() {
    return http.get('/api/customers', () => HttpResponse.json(createCustomerPage([])))
  },
  getCustomersError() {
    return http.get('/api/customers', () => HttpResponse.json({ message: 'Server error' }, { status: 500 }))
  },
  createCustomerSuccess(customer: CustomerDto = customerFixtures.active) {
    return http.post('/api/customers', () => HttpResponse.json(customer, { status: 201 }))
  },
  updateCustomerSuccess(customer: CustomerDto = customerFixtures.active) {
    return http.put('/api/customers/:id', () => HttpResponse.json(customer))
  },
  changeCustomerStatusSuccess(customer: CustomerDto) {
    return http.patch('/api/customers/:id/status', () => HttpResponse.json(customer))
  },
}
