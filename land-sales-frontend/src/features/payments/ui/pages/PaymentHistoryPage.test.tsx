import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createPaymentPage, paymentFixtures, paymentHandlers } from '../../../../test/handlers'
import { renderWithProviders } from '../../../../test/render'
import { server } from '../../../../test/server'
import { PaymentHistoryPage } from './PaymentHistoryPage'

function renderPaymentHistoryPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/pagos" element={<PaymentHistoryPage />} />
      <Route path="/pagos/:id" element={<h1>Detalle pago route</h1>} />
    </Routes>,
    { initialEntries: ['/pagos'] },
  )
}

async function selectPaymentMethod(option: string) {
  const user = userEvent.setup()
  fireEvent.mouseDown(screen.getAllByRole('combobox')[0])
  await user.click(screen.getByText(option))
}

function getButton(name: string) {
  const button = [...document.querySelectorAll('button')].find((element) => element.textContent?.includes(name))
  expect(button).toBeDefined()
  return button as HTMLButtonElement
}

describe('PaymentHistoryPage', () => {
  it('shows the loading state while payments are being fetched', () => {
    server.use(
      http.get('/api/payments', async () => {
        await delay(100)
        return HttpResponse.json(createPaymentPage())
      }),
    )

    renderPaymentHistoryPage()

    expect(screen.getByText('Cargando pagos...')).toBeInTheDocument()
  })

  it('shows the empty state when there are no payments', async () => {
    server.use(paymentHandlers.getPaymentsEmpty())

    renderPaymentHistoryPage()

    expect(await screen.findByText('Sin pagos registrados')).toBeInTheDocument()
    expect(screen.getByText('Los pagos aparecerán aquí después de registrarlos desde un estado de cuenta.')).toBeInTheDocument()
  })

  it('shows payments returned by the API', async () => {
    server.use(paymentHandlers.getPaymentsSuccess())

    renderPaymentHistoryPage()

    expect(await screen.findByText('Ana Lopez')).toBeInTheDocument()
    expect(screen.getAllByText('25').length).toBeGreaterThan(0)
    expect(screen.getByText('5551234567')).toBeInTheDocument()
    expect(screen.getByText('A-01')).toBeInTheDocument()
    expect(screen.getByText('Transferencia')).toBeInTheDocument()
    expect(screen.getByText('Usuario Prueba')).toBeInTheDocument()
  })

  it('shows an error when the API fails', async () => {
    server.use(paymentHandlers.getPaymentsError())

    renderPaymentHistoryPage()

    expect(await screen.findByText('No fue posible cargar el historial de pagos.')).toBeInTheDocument()
  })

  it('sends search, payment method and date filters to the API', async () => {
    const user = userEvent.setup()
    const receivedQueries: string[] = []

    server.use(
      http.get('/api/payments', ({ request }) => {
        receivedQueries.push(new URL(request.url).search)
        return HttpResponse.json(createPaymentPage([]))
      }),
    )

    renderPaymentHistoryPage()
    await screen.findByText('Sin pagos registrados')

    await user.type(screen.getByLabelText('Buscar por folio, cliente, teléfono, lote o venta'), 'Ana')
    await selectPaymentMethod('Transferencia')
    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-04-01' } })
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-04-30' } })

    await waitFor(() => {
      expect(receivedQueries.some((query) => query.includes('search=Ana'))).toBe(true)
      expect(receivedQueries.some((query) => query.includes('paymentMethod=TRANSFER'))).toBe(true)
      expect(receivedQueries.some((query) => query.includes('dateFrom=2026-04-01'))).toBe(true)
      expect(receivedQueries.some((query) => query.includes('dateTo=2026-04-30'))).toBe(true)
    })
  })

  it('clears filters after they are applied', async () => {
    const user = userEvent.setup()
    server.use(paymentHandlers.getPaymentsSuccess())

    renderPaymentHistoryPage()
    await screen.findByText('Ana Lopez')

    await user.type(screen.getByLabelText('Buscar por folio, cliente, teléfono, lote o venta'), 'Ana')
    expect(await screen.findByRole('button', { name: 'Limpiar filtros' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }))

    expect(screen.getByLabelText('Buscar por folio, cliente, teléfono, lote o venta')).toHaveValue('')
  })

  it('sends pagination changes to the API', async () => {
    const receivedQueries: string[] = []

    server.use(
      http.get('/api/payments', ({ request }) => {
        receivedQueries.push(new URL(request.url).search)
        return HttpResponse.json(createPaymentPage([paymentFixtures.summary], { totalElements: 30, totalPages: 2, last: false }))
      }),
    )

    renderPaymentHistoryPage()
    await screen.findByText('Ana Lopez')

    await userEvent.click(screen.getByLabelText('Go to next page'))

    await waitFor(() => {
      expect(receivedQueries.some((query) => query.includes('page=1'))).toBe(true)
    })
  })

  it('navigates to payment detail from the row action', async () => {
    const user = userEvent.setup()
    server.use(paymentHandlers.getPaymentsSuccess())

    renderPaymentHistoryPage()
    await screen.findByText('Ana Lopez')

    await user.click(getButton('Ver detalle'))

    expect(screen.getByRole('heading', { name: 'Detalle pago route' })).toBeInTheDocument()
  })
})
