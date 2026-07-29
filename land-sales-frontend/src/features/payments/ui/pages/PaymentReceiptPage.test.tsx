import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { paymentFixtures, paymentHandlers } from '../../../../test/handlers'
import { renderWithProviders } from '../../../../test/render'
import { server } from '../../../../test/server'
import { PaymentReceiptPage } from './PaymentReceiptPage'

function renderPaymentReceiptPage(initialEntry = '/pagos/701/recibo') {
  return renderWithProviders(
    <Routes>
      <Route path="/pagos/:id" element={<h1>Detalle pago route</h1>} />
      <Route path="/pagos/:id/recibo" element={<PaymentReceiptPage />} />
    </Routes>,
    { initialEntries: [initialEntry] },
  )
}

describe('PaymentReceiptPage', () => {
  it('shows the loading state while the receipt is being fetched', () => {
    server.use(
      http.get('/api/payments/:id', async () => {
        await delay(100)
        return HttpResponse.json(paymentFixtures.detail)
      }),
    )

    renderPaymentReceiptPage()

    expect(screen.getByText('Cargando recibo...')).toBeInTheDocument()
  })

  it('shows an error when the receipt cannot be loaded', async () => {
    server.use(paymentHandlers.getPaymentError())

    renderPaymentReceiptPage()

    expect(await screen.findByText('No fue posible cargar el recibo.')).toBeInTheDocument()
  })

  it('renders printable receipt information', async () => {
    server.use(paymentHandlers.getPaymentSuccess())

    renderPaymentReceiptPage()

    expect(await screen.findByText('RECIBO DE PAGO')).toBeInTheDocument()
    expect(screen.getByText('Land Sales')).toBeInTheDocument()
    expect(screen.getByText(/Folio:/)).toHaveTextContent('Folio: 25')
    expect(screen.getByText(/Recibí de:/)).toHaveTextContent('Ana Lopez')
    expect(screen.getByText('Teléfono: 5551234567')).toBeInTheDocument()
    expect(screen.getByText('Forma de pago: Transferencia')).toBeInTheDocument()
    expect(screen.getByText('Referencia: TR-12345')).toBeInTheDocument()
    expect(screen.getByText(/Total recibido:/)).toBeInTheDocument()
    expect(screen.getByText(/A-01 · Importe aplicado/)).toBeInTheDocument()
    expect(screen.getByText('Recibió: Administrador local')).toBeInTheDocument()
  })

  it('navigates back to the payment detail', async () => {
    const user = userEvent.setup()
    server.use(paymentHandlers.getPaymentSuccess())

    renderPaymentReceiptPage()
    await screen.findByText('RECIBO DE PAGO')

    await user.click(screen.getByRole('button', { name: 'Volver al pago #25' }))

    expect(screen.getByRole('heading', { name: 'Detalle pago route' })).toBeInTheDocument()
  })

  it('prints the receipt when the user clicks print', async () => {
    const user = userEvent.setup()
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined)
    server.use(paymentHandlers.getPaymentSuccess())

    renderPaymentReceiptPage()
    await screen.findByText('RECIBO DE PAGO')

    await user.click(screen.getByRole('button', { name: 'Imprimir' }))

    await waitFor(() => {
      expect(print).toHaveBeenCalledTimes(1)
    })
  })
})
