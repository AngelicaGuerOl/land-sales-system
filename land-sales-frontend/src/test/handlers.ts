import { http, HttpResponse } from 'msw'
import type { RequestHandler } from 'msw'
import type { CustomerDto, CustomerPageDto } from '../features/customers/infrastructure/mappers/CustomerMapper'
import type {
  BlockDto,
  LotDto,
  LotificationDto,
  LotPriceHistoryDto,
} from '../features/lots/infrastructure/mappers/LotMapper'

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

export const lotFixtures = {
  blocks: [
    {
      id: 10,
      lotificationId: 100,
      lotificationName: 'Lotificacion Norte',
      code: 'A',
      areaM2: 1200,
      plannedLotCount: 20,
      registeredLotCount: 2,
      notes: null,
      createdAt: '2026-02-01T10:00:00',
      updatedAt: '2026-02-01T10:00:00',
    },
    {
      id: 11,
      lotificationId: 100,
      lotificationName: 'Lotificacion Norte',
      code: 'B',
      areaM2: 980,
      plannedLotCount: 14,
      registeredLotCount: 1,
      notes: null,
      createdAt: '2026-02-02T10:00:00',
      updatedAt: '2026-02-02T10:00:00',
    },
  ],
  lotifications: [
    {
      id: 100,
      name: 'Lotificacion Norte',
      description: 'Proyecto ficticio de pruebas',
      address: 'Avenida Prueba 100',
      planStorageKey: null,
      active: true,
    },
  ],
  available: {
    id: 101,
    blockId: 10,
    blockCode: 'A',
    lotNumber: '01',
    code: 'A-01',
    areaM2: 120,
    frontMeters: 8,
    depthMeters: 15,
    price: 250000,
    status: 'AVAILABLE',
    locationReference: 'Frente al parque',
    notes: 'Lote ficticio disponible',
    version: 3,
  },
  blocked: {
    id: 102,
    blockId: 10,
    blockCode: 'A',
    lotNumber: '02',
    code: 'A-02',
    areaM2: 115,
    frontMeters: 7.5,
    depthMeters: 15,
    price: 240000,
    status: 'BLOCKED',
    locationReference: null,
    notes: null,
    version: 4,
  },
  sold: {
    id: 103,
    blockId: 11,
    blockCode: 'B',
    lotNumber: '03',
    code: 'B-03',
    areaM2: 130,
    frontMeters: 8.5,
    depthMeters: 15.3,
    price: 280000,
    status: 'SOLD',
    locationReference: 'Esquina',
    notes: 'Lote vendido ficticio',
    version: 2,
  },
  priceHistory: [
    {
      id: 1001,
      previousPrice: 230000,
      newPrice: 250000,
      reason: 'Ajuste comercial ficticio',
      changedBy: 'tester',
      changedAt: '2026-03-01T12:00:00',
    },
  ],
} satisfies {
  blocks: BlockDto[]
  lotifications: LotificationDto[]
  available: LotDto
  blocked: LotDto
  sold: LotDto
  priceHistory: LotPriceHistoryDto[]
}

export const lotHandlers = {
  getBlocksSuccess(blocks: BlockDto[] = lotFixtures.blocks) {
    return http.get('/api/blocks', () => HttpResponse.json(blocks))
  },
  getBlocksError() {
    return http.get('/api/blocks', () => HttpResponse.json({ message: 'Server error' }, { status: 500 }))
  },
  getLotificationsSuccess(lotifications: LotificationDto[] = lotFixtures.lotifications) {
    return http.get('/api/lotifications', () => HttpResponse.json(lotifications))
  },
  getLotsSuccess(lots: LotDto[] = [lotFixtures.available, lotFixtures.blocked, lotFixtures.sold]) {
    return http.get('/api/lots', () => HttpResponse.json(lots))
  },
  getLotsEmpty() {
    return http.get('/api/lots', () => HttpResponse.json([]))
  },
  getLotsError() {
    return http.get('/api/lots', () => HttpResponse.json({ message: 'Server error' }, { status: 500 }))
  },
  getLotSuccess(lot: LotDto = lotFixtures.available) {
    return http.get('/api/lots/:id', () => HttpResponse.json(lot))
  },
  getPriceHistorySuccess(history: LotPriceHistoryDto[] = lotFixtures.priceHistory) {
    return http.get('/api/lots/:id/price-history', () => HttpResponse.json(history))
  },
  getPriceHistoryEmpty() {
    return http.get('/api/lots/:id/price-history', () => HttpResponse.json([]))
  },
  createLotSuccess(lot: LotDto = lotFixtures.available) {
    return http.post('/api/lots', () => HttpResponse.json(lot, { status: 201 }))
  },
  updateLotSuccess(lot: LotDto = lotFixtures.available) {
    return http.put('/api/lots/:id', () => HttpResponse.json(lot))
  },
  changeLotStatusSuccess(lot: LotDto) {
    return http.patch('/api/lots/:id/status', () => HttpResponse.json(lot))
  },
  badRequest(message = 'Revisa los datos capturados.') {
    return HttpResponse.json({ message }, { status: 400 })
  },
  conflict(message = 'El lote cambió o entra en conflicto con otro registro.') {
    return HttpResponse.json({ message }, { status: 409 })
  },
}
