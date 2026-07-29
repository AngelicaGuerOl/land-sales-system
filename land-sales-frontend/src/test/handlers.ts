import { http, HttpResponse } from 'msw'
import type { RequestHandler } from 'msw'
import type { AccountStatement, StatementPage, StatementSummary } from '../features/accountstatement/domain/entities/AccountStatement'
import type { CustomerDto, CustomerPageDto } from '../features/customers/infrastructure/mappers/CustomerMapper'
import type {
  BlockDto,
  LotDto,
  LotificationDto,
  LotPriceHistoryDto,
} from '../features/lots/infrastructure/mappers/LotMapper'
import type { PaymentDetail, PaymentPage, PaymentSummary } from '../features/payments/domain/entities/Payment'
import type { ReportSummary } from '../features/reports/domain/entities/ReportSummary'
import type { SaleDetail, SalePage, SaleSummary } from '../features/sales/domain/entities/Sale'

export const handlers: RequestHandler[] = []

export const accountStatementFixtures = {
  summary: {
    customerId: 1,
    customerName: 'Ana Lopez',
    phone: '5551234567',
    financedLotCount: 1,
    totalAgreedAmount: 250000,
    totalDownPayment: 50000,
    totalPaid: 66666.67,
    totalOutstandingBalance: 183333.33,
  },
  paidSummary: {
    customerId: 2,
    customerName: 'Bruno Perez',
    phone: '5557654321',
    financedLotCount: 0,
    totalAgreedAmount: 180000,
    totalDownPayment: 180000,
    totalPaid: 180000,
    totalOutstandingBalance: 0,
  },
  detail: {
    customer: {
      id: 1,
      fullName: 'Ana Lopez',
      phone: '5551234567',
      alternatePhone: null,
      address: 'Calle Norte 100',
    },
    totals: {
      totalAgreedAmount: 430000,
      totalDownPayment: 230000,
      totalFinancedAmount: 200000,
      totalPaid: 66666.67,
      totalOutstandingBalance: 183333.33,
      lotsWithBalance: 1,
    },
    sales: [
      {
        saleId: 501,
        folio: 'V-2026-0001',
        saleDate: '2026-03-10',
        lots: [
          {
            saleLotId: 901,
            lotId: 101,
            code: 'A-01',
            blockCode: 'A',
            lotNumber: '01',
            areaM2: 120,
            frontMeters: 8,
            depthMeters: 15,
            agreedPrice: 250000,
            downPayment: 50000,
            financedAmount: 200000,
            totalPaid: 16666.67,
            outstandingBalance: 183333.33,
            status: 'ACTIVE',
            installments: [
              {
                id: 3001,
                installmentNumber: 1,
                paymentMonth: '2026-04-01',
                amount: 16666.67,
                paidAmount: 0,
                outstandingAmount: 16666.67,
                status: 'PENDING',
              },
              {
                id: 3002,
                installmentNumber: 2,
                paymentMonth: '2026-05-01',
                amount: 16666.67,
                paidAmount: 5000,
                outstandingAmount: 11666.67,
                status: 'PARTIAL',
              },
            ],
          },
          {
            saleLotId: 902,
            lotId: 102,
            code: 'B-02',
            blockCode: 'B',
            lotNumber: '02',
            areaM2: 100,
            frontMeters: null,
            depthMeters: null,
            agreedPrice: 180000,
            downPayment: 180000,
            financedAmount: 0,
            totalPaid: 180000,
            outstandingBalance: 0,
            status: 'PAID',
            installments: [],
          },
        ],
      },
    ],
  },
} satisfies {
  summary: StatementSummary
  paidSummary: StatementSummary
  detail: AccountStatement
}

export function createStatementPage(
  content: StatementSummary[] = [accountStatementFixtures.summary],
  overrides: Partial<Omit<StatementPage, 'content'>> = {},
): StatementPage {
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

export const accountStatementHandlers = {
  getStatementCustomersSuccess(page: StatementPage = createStatementPage()) {
    return http.get('/api/account-statements/customers', () => HttpResponse.json(page))
  },
  getStatementCustomersEmpty() {
    return http.get('/api/account-statements/customers', () => HttpResponse.json(createStatementPage([])))
  },
  getStatementCustomersError() {
    return http.get('/api/account-statements/customers', () => HttpResponse.json({ message: 'Server error' }, { status: 500 }))
  },
  getCustomerStatementSuccess(statement: AccountStatement = accountStatementFixtures.detail) {
    return http.get('/api/account-statements/customers/:id', () => HttpResponse.json(statement))
  },
  getCustomerStatementError() {
    return http.get('/api/account-statements/customers/:id', () => HttpResponse.json({ message: 'Server error' }, { status: 500 }))
  },
}

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
      lotificationName: 'Zona Norte',
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
      lotificationName: 'Zona Norte',
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
      name: 'Zona Norte',
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

export const saleFixtures = {
  customer: {
    id: 1,
    fullName: 'Ana Lopez',
    phone: '5551234567',
    alternatePhone: null,
    address: 'Calle Norte 100',
    active: true,
    createdAt: '2026-03-01T10:00:00',
    updatedAt: '2026-03-01T10:00:00',
  },
  availableLot: {
    id: 101,
    blockId: 10,
    code: 'A-01',
    blockCode: 'A',
    lotNumber: '01',
    areaM2: 120,
    frontMeters: 8,
    depthMeters: 15,
    price: 250000,
    status: 'AVAILABLE',
    locationReference: 'Frente al parque',
    notes: null,
    version: 3,
  },
  summary: {
    id: 501,
    folio: 'V-2026-0001',
    saleDate: '2026-03-10',
    customerId: 1,
    customerName: 'Ana Lopez',
    customerPhone: '5551234567',
    lotCount: 1,
    lotCodes: ['A-01'],
    totalAgreedPrice: 250000,
    totalDownPayment: 50000,
    totalFinancedAmount: 200000,
    status: 'ACTIVE',
    createdAt: '2026-03-10T10:00:00',
  },
  detail: {
    id: 501,
    folio: 'V-2026-0001',
    saleDate: '2026-03-10',
    customer: {
      id: 1,
      fullName: 'Ana Lopez',
      phone: '5551234567',
      address: 'Calle Norte 100',
      alternatePhone: null,
    },
    createdBy: {
      id: 10,
      fullName: 'Usuario Prueba',
      username: 'tester',
    },
    totalAgreedPrice: 250000,
    totalDownPayment: 50000,
    totalFinancedAmount: 200000,
    status: 'ACTIVE',
    createdAt: '2026-03-10T10:00:00',
    updatedAt: '2026-03-10T10:00:00',
    lots: [
      {
        lotId: 101,
        code: 'A-01',
        blockCode: 'A',
        lotNumber: '01',
        areaM2: 120,
        frontMeters: 8,
        depthMeters: 15,
        agreedPrice: 250000,
        downPayment: 50000,
        installmentCount: 12,
        financedAmount: 200000,
        outstandingBalance: 200000,
        installmentAmount: 16666.67,
        firstPaymentMonth: '2026-04-01',
        status: 'ACTIVE',
        installments: [
          {
            installmentNumber: 1,
            paymentMonth: '2026-04-01',
            amount: 16666.67,
            paidAmount: 0,
            status: 'PENDING',
          },
        ],
      },
    ],
  },
} satisfies {
  customer: CustomerDto
  availableLot: LotDto
  summary: SaleSummary
  detail: SaleDetail
}

export function createSalePage(
  content: SaleSummary[] = [saleFixtures.summary],
  overrides: Partial<Omit<SalePage, 'content'>> = {},
): SalePage {
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

export const saleHandlers = {
  getCustomersSuccess(customers = [saleFixtures.customer]) {
    return http.get('/api/customers', () => HttpResponse.json(createCustomerPage(customers)))
  },
  getAvailableLotsSuccess(lots: LotDto[] = [saleFixtures.availableLot]) {
    return http.get('/api/lots', () => HttpResponse.json(lots))
  },
  getSalesSuccess(page: SalePage = createSalePage()) {
    return http.get('/api/sales', () => HttpResponse.json(page))
  },
  getSalesEmpty() {
    return http.get('/api/sales', () => HttpResponse.json(createSalePage([])))
  },
  getSalesError() {
    return http.get('/api/sales', () => HttpResponse.json({ message: 'Server error' }, { status: 500 }))
  },
  getSaleSuccess(sale: SaleDetail = saleFixtures.detail) {
    return http.get('/api/sales/:id', () => HttpResponse.json(sale))
  },
  getSaleError() {
    return http.get('/api/sales/:id', () => HttpResponse.json({ message: 'Server error' }, { status: 500 }))
  },
  createSaleSuccess(sale: SaleDetail = saleFixtures.detail) {
    return http.post('/api/sales', () => HttpResponse.json(sale, { status: 201 }))
  },
}

export const paymentFixtures = {
  summary: {
    id: 701,
    paymentNumber: 25,
    paymentDate: '2026-04-15',
    customerId: 1,
    customerName: 'Ana Lopez',
    customerPhone: '5551234567',
    lotCodes: ['A-01'],
    totalAmount: 16666.67,
    paymentMethod: 'TRANSFER',
    receivedByName: 'Usuario Prueba',
    createdAt: '2026-04-15T11:00:00',
  },
  cashSummary: {
    id: 702,
    paymentNumber: 26,
    paymentDate: '2026-04-16',
    customerId: 2,
    customerName: 'Bruno Perez',
    customerPhone: '5557654321',
    lotCodes: ['B-02'],
    totalAmount: 12000,
    paymentMethod: 'CASH',
    receivedByName: 'Usuario Prueba',
    createdAt: '2026-04-16T12:00:00',
  },
  detail: {
    id: 701,
    paymentNumber: 25,
    paymentDate: '2026-04-15',
    customer: {
      id: 1,
      fullName: 'Ana Lopez',
      phone: '5551234567',
    },
    paymentMethod: 'TRANSFER',
    reference: 'TR-12345',
    totalAmount: 16666.67,
    receivedBy: {
      id: 10,
      fullName: 'Local Administrator',
      username: 'admin',
    },
    createdAt: '2026-04-15T11:00:00',
    allocations: [
      {
        saleLotId: 901,
        lotCode: 'A-01',
        saleFolio: 'V-2026-0001',
        amount: 16666.67,
        balanceBefore: 200000,
        balanceAfter: 183333.33,
        installments: [
          {
            installmentId: 3001,
            installmentNumber: 1,
            paymentMonth: '2026-04-01',
            amount: 16666.67,
            balanceBefore: 16666.67,
            balanceAfter: 0,
            status: 'PAID',
          },
        ],
      },
    ],
  },
} satisfies {
  summary: PaymentSummary
  cashSummary: PaymentSummary
  detail: PaymentDetail
}

export function createPaymentPage(
  content: PaymentSummary[] = [paymentFixtures.summary],
  overrides: Partial<Omit<PaymentPage, 'content'>> = {},
): PaymentPage {
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

export const paymentHandlers = {
  getPaymentsSuccess(page: PaymentPage = createPaymentPage()) {
    return http.get('/api/payments', () => HttpResponse.json(page))
  },
  getPaymentsEmpty() {
    return http.get('/api/payments', () => HttpResponse.json(createPaymentPage([])))
  },
  getPaymentsError() {
    return http.get('/api/payments', () => HttpResponse.json({ message: 'Server error' }, { status: 500 }))
  },
  getPaymentSuccess(payment: PaymentDetail = paymentFixtures.detail) {
    return http.get('/api/payments/:id', () => HttpResponse.json(payment))
  },
  getPaymentError() {
    return http.get('/api/payments/:id', () => HttpResponse.json({ message: 'Server error' }, { status: 500 }))
  },
  createPaymentSuccess(payment: PaymentDetail = paymentFixtures.detail) {
    return http.post('/api/payments', () => HttpResponse.json(payment, { status: 201 }))
  },
  badRequest(message = 'Revisa los datos del pago.') {
    return HttpResponse.json({ message }, { status: 400 })
  },
  conflict(message = 'El pago entra en conflicto con el estado actual de la venta.') {
    return HttpResponse.json({ message }, { status: 409 })
  },
}

export const reportFixtures = {
  summary: {
    dateFrom: '2026-07-01',
    dateTo: '2026-07-28',
    salesCount: 3,
    soldLotsCount: 4,
    totalAgreedAmount: 780000,
    totalDownPayment: 180000,
    totalFinancedAmount: 600000,
    laterPaymentsAmount: 45000,
    totalCollectedAmount: 225000,
    outstandingBalance: 555000,
    byBlock: [
      {
        blockCode: 'A',
        soldLotsCount: 2,
        totalAgreedAmount: 410000,
      },
      {
        blockCode: 'B',
        soldLotsCount: 2,
        totalAgreedAmount: 370000,
      },
    ],
  },
  empty: {
    dateFrom: '2026-07-01',
    dateTo: '2026-07-28',
    salesCount: 0,
    soldLotsCount: 0,
    totalAgreedAmount: 0,
    totalDownPayment: 0,
    totalFinancedAmount: 0,
    laterPaymentsAmount: 0,
    totalCollectedAmount: 0,
    outstandingBalance: 0,
    byBlock: [],
  },
} satisfies Record<string, ReportSummary>

export const reportHandlers = {
  getSummarySuccess(summary: ReportSummary = reportFixtures.summary) {
    return http.get('/api/reports/summary', () => HttpResponse.json(summary))
  },
  getSummaryEmpty(summary: ReportSummary = reportFixtures.empty) {
    return http.get('/api/reports/summary', () => HttpResponse.json(summary))
  },
  getSummaryError() {
    return http.get('/api/reports/summary', () => HttpResponse.json({ message: 'Server error' }, { status: 500 }))
  },
}
