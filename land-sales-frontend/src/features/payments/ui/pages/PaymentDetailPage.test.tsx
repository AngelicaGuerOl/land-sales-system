import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { paymentFixtures, paymentHandlers } from '../../../../test/handlers'
import { renderWithProviders } from '../../../../test/render'
import { server } from '../../../../test/server'
import { PaymentDetailPage } from './PaymentDetailPage'

function renderPaymentDetailPage(initialEntry = '/pagos/701') {
  return renderWithProviders(
    <Routes>
      <Route path="/pagos" element={<h1>Historial pagos route</h1>} />
      <Route path="/pagos/:id" element={<PaymentDetailPage />} />
      <Route path="/pagos/:id/recibo" element={<h1>Recibo route</h1>} />
    </Routes>,
    { initialEntries: [initialEntry] },
  )
}

describe('PaymentDetailPage', () => {
  it('shows the loading state while payment detail is being fetched', () => {
    server.use(
      http.get('/api/payments/:id', async () => {
        await delay(100)
        return HttpResponse.json(paymentFixtures.detail)
      }),
    )

    renderPaymentDetailPage()

    expect(screen.getByText('Cargando detalle del pago...')).toBeInTheDocument()
  })

  it('shows an error when the detail cannot be loaded', async () => {
    server.use(paymentHandlers.getPaymentError())

    renderPaymentDetailPage()

    expect(await screen.findByText('No fue posible cargar el detalle del pago.')).toBeInTheDocument()
  })

  it('renders payment detail, allocation and installment information', async () => {
    server.use(paymentHandlers.getPaymentSuccess())

    renderPaymentDetailPage()

    expect(await screen.findByText('Pago #25')).toBeInTheDocument()
    expect(screen.getByText(/Ana Lopez/)).toBeInTheDocument()
    expect(screen.getByText(/5551234567/)).toBeInTheDocument()
    expect(screen.getByText('Transferencia')).toBeInTheDocument()
    expect(screen.getByText(/Total recibido:/)).toBeInTheDocument()
    expect(screen.getByText(/Administrador local/)).toBeInTheDocument()
    expect(screen.getByText('Referencia: TR-12345')).toBeInTheDocument()
    expect(screen.getByText('A-01')).toBeInTheDocument()
    expect(screen.getByText(/Venta V-2026-0001/)).toBeInTheDocument()
    expect(screen.getByText('abril de 2026')).toBeInTheDocument()
  })

  it('shows the empty state when an allocation has no installments', async () => {
    server.use(
      paymentHandlers.getPaymentSuccess({
        ...paymentFixtures.detail,
        allocations: [{ ...paymentFixtures.detail.allocations[0], installments: [] }],
      }),
    )

    renderPaymentDetailPage()

    expect(await screen.findByText('Sin mensualidades')).toBeInTheDocument()
    expect(screen.getByText('No hay mensualidades asociadas a esta asignación.')).toBeInTheDocument()
  })

  it('navigates back to the payment history', async () => {
    const user = userEvent.setup()
    server.use(paymentHandlers.getPaymentSuccess())

    renderPaymentDetailPage()
    await screen.findByText('Pago #25')

    await user.click(screen.getByRole('button', { name: 'Volver al historial de pagos' }))

    expect(screen.getByRole('heading', { name: 'Historial pagos route' })).toBeInTheDocument()
  })

  it('navigates to the receipt page from receipt actions', async () => {
    const user = userEvent.setup()
    server.use(paymentHandlers.getPaymentSuccess())

    renderPaymentDetailPage()
    await screen.findByText('Pago #25')

    await user.click(screen.getByRole('button', { name: 'Ver recibo' }))

    expect(screen.getByRole('heading', { name: 'Recibo route' })).toBeInTheDocument()
  })
})
