import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { accountStatementFixtures, accountStatementHandlers, paymentFixtures, paymentHandlers } from '../../../../test/handlers'
import { renderWithProviders } from '../../../../test/render'
import { server } from '../../../../test/server'
import type { AccountStatement } from '../../domain/entities/AccountStatement'
import { CustomerStatementPage } from './CustomerStatementPage'

function renderCustomerStatementPage(initialEntry = '/estado-de-cuenta/1') {
  return renderWithProviders(
    <Routes>
      <Route path="/estado-de-cuenta" element={<h1>Estados route</h1>} />
      <Route path="/estado-de-cuenta/:customerId" element={<CustomerStatementPage />} />
      <Route path="/pagos/:id/recibo" element={<h1>Recibo route</h1>} />
    </Routes>,
    { initialEntries: [initialEntry] },
  )
}

async function selectShowFilter(option: string) {
  const user = userEvent.setup()
  fireEvent.mouseDown(document.querySelector('[role="combobox"]') as HTMLElement)
  await user.click(screen.getByText(option))
}

function getButton(name: string) {
  const button = [...document.querySelectorAll('button')].find((element) => element.textContent?.includes(name))
  expect(button).toBeDefined()
  return button as HTMLButtonElement
}

function settledStatement(): AccountStatement {
  return {
    ...accountStatementFixtures.detail,
    totals: {
      ...accountStatementFixtures.detail.totals,
      totalPaid: 430000,
      totalOutstandingBalance: 0,
      lotsWithBalance: 0,
    },
    sales: accountStatementFixtures.detail.sales.map((sale) => ({
      ...sale,
      lots: sale.lots.map((lot) => ({
        ...lot,
        totalPaid: lot.agreedPrice,
        outstandingBalance: 0,
        status: 'PAID',
        installments: lot.installments.map((installment) => ({
          ...installment,
          paidAmount: installment.amount,
          outstandingAmount: 0,
          status: 'PAID',
        })),
      })),
    })),
  }
}

describe('CustomerStatementPage', () => {
  it('shows the loading state while the statement is being fetched', () => {
    server.use(
      http.get('/api/account-statements/customers/:id', async () => {
        await delay(100)
        return HttpResponse.json(accountStatementFixtures.detail)
      }),
    )

    renderCustomerStatementPage()

    expect(screen.getByText('Cargando estado de cuenta...')).toBeInTheDocument()
  })

  it('shows an error when the statement cannot be loaded', async () => {
    server.use(accountStatementHandlers.getCustomerStatementError())

    renderCustomerStatementPage()

    expect(await screen.findByText('No fue posible cargar el estado de cuenta.')).toBeInTheDocument()
  })

  it('renders customer totals and lots with outstanding balance by default', async () => {
    server.use(accountStatementHandlers.getCustomerStatementSuccess())

    renderCustomerStatementPage()

    expect(await screen.findByText('Ana Lopez')).toBeInTheDocument()
    expect(screen.getByText('5551234567')).toBeInTheDocument()
    expect(screen.getByText('Total acordado')).toBeInTheDocument()
    expect(screen.getByText('Total financiado')).toBeInTheDocument()
    expect(screen.getByText('Saldo pendiente')).toBeInTheDocument()
    expect(screen.getByText('A-01')).toBeInTheDocument()
    expect(screen.getByText(/Venta V-2026-0001/)).toBeInTheDocument()
    expect(screen.getByText('abril de 2026')).toBeInTheDocument()
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0)
    expect(screen.queryByText('B-02')).not.toBeInTheDocument()
  })

  it('filters lots by paid and all states', async () => {
    server.use(accountStatementHandlers.getCustomerStatementSuccess())

    renderCustomerStatementPage()
    await screen.findByText('A-01')

    await selectShowFilter('Liquidados')
    expect(await screen.findByText('B-02')).toBeInTheDocument()
    expect(screen.getByText('Liquidado')).toBeInTheDocument()
    expect(screen.queryByText('A-01')).not.toBeInTheDocument()

    await selectShowFilter('Todos')
    expect(await screen.findByText('A-01')).toBeInTheDocument()
    expect(screen.getByText('B-02')).toBeInTheDocument()
  })

  it('shows a settled account instead of allowing payment registration', async () => {
    server.use(accountStatementHandlers.getCustomerStatementSuccess(settledStatement()))

    renderCustomerStatementPage()

    expect(await screen.findByText('Cuenta liquidada')).toBeInTheDocument()
    expect([...document.querySelectorAll('button')].some((element) => element.textContent?.includes('Registrar pago'))).toBe(false)
  })

  it('navigates back to the statement customer list', async () => {
    const user = userEvent.setup()
    server.use(accountStatementHandlers.getCustomerStatementSuccess())

    renderCustomerStatementPage()
    await screen.findByText('Ana Lopez')

    await user.click(getButton('Volver al estado de cuenta'))

    expect(screen.getByRole('heading', { name: 'Estados route' })).toBeInTheDocument()
  })

  it('registers a payment, refreshes the statement and opens the receipt', async () => {
    const user = userEvent.setup()
    let statementRequests = 0
    let receivedBody: unknown

    server.use(
      http.get('/api/account-statements/customers/:id', () => {
        statementRequests += 1
        return HttpResponse.json(accountStatementFixtures.detail)
      }),
      http.post('/api/payments', async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json(paymentFixtures.detail, { status: 201 })
      }),
    )

    renderCustomerStatementPage()
    await screen.findByText('Ana Lopez')

    await user.click(getButton('Registrar pago'))
    await user.click(screen.getByLabelText('1. abril de 2026'))
    await user.click(getButton('Revisar pago'))
    await waitFor(() => {
      expect(getButton('Confirmar pago')).toBeEnabled()
    })
    await user.click(getButton('Confirmar pago'))

    expect(await screen.findByText('Pago registrado correctamente')).toBeInTheDocument()
    expect(screen.getByText('Folio: 25')).toBeInTheDocument()
    await waitFor(() => {
      expect(statementRequests).toBeGreaterThan(1)
    })
    expect(receivedBody).toEqual({
      customerId: 1,
      paymentMethod: 'CASH',
      reference: null,
      allocations: [
        {
          saleLotId: 901,
          installments: [{ installmentId: 3001, amount: 16666.67 }],
        },
      ],
    })

    await user.click(getButton('Ver recibo'))
    expect(screen.getByRole('heading', { name: 'Recibo route' })).toBeInTheDocument()
  })

  it('shows the API error when payment registration fails', async () => {
    const user = userEvent.setup()
    server.use(
      accountStatementHandlers.getCustomerStatementSuccess(),
      http.post('/api/payments', () => paymentHandlers.badRequest('El monto excede el saldo pendiente.')),
    )

    renderCustomerStatementPage()
    await screen.findByText('Ana Lopez')

    await user.click(getButton('Registrar pago'))
    await user.click(screen.getByLabelText('1. abril de 2026'))
    await user.click(getButton('Revisar pago'))
    await waitFor(() => {
      expect(getButton('Confirmar pago')).toBeEnabled()
    })
    await user.click(getButton('Confirmar pago'))

    expect(await screen.findByText('El monto excede el saldo pendiente.')).toBeInTheDocument()
  })
})
