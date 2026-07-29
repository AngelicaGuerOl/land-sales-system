import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { saleFixtures, saleHandlers } from '../../../../test/handlers'
import { renderWithProviders } from '../../../../test/render'
import { server } from '../../../../test/server'
import { SaleDetailPage } from './SaleDetailPage'

function renderSaleDetailPage(initialEntry = '/ventas/501') {
  return renderWithProviders(
    <Routes>
      <Route path="/ventas" element={<h1>Historial route</h1>} />
      <Route path="/ventas/:id" element={<SaleDetailPage />} />
    </Routes>,
    { initialEntries: [initialEntry] },
  )
}

describe('SaleDetailPage', () => {
  it('shows the loading state while sale detail is being fetched', () => {
    server.use(
      http.get('/api/sales/:id', async () => {
        await delay(100)
        return HttpResponse.json(saleFixtures.detail)
      }),
    )

    renderSaleDetailPage()

    expect(screen.getByText('Cargando detalle de venta...')).toBeInTheDocument()
  })

  it('shows an error when the detail cannot be loaded', async () => {
    server.use(saleHandlers.getSaleError())

    renderSaleDetailPage()

    expect(await screen.findByText('No fue posible cargar la venta.')).toBeInTheDocument()
  })

  it('renders sale detail, customer, lot and installment information', async () => {
    server.use(saleHandlers.getSaleSuccess())

    renderSaleDetailPage()

    expect(await screen.findByText('V-2026-0001')).toBeInTheDocument()
    expect(screen.getByText('Ana Lopez')).toBeInTheDocument()
    expect(screen.getByText('5551234567')).toBeInTheDocument()
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(1)
    expect(screen.getByText('Total acordado')).toBeInTheDocument()
    expect(screen.getByText('Enganche total')).toBeInTheDocument()
    expect(screen.getByText('Saldo financiado')).toBeInTheDocument()
    expect(screen.getByText(/A-01 · En pagos · Saldo pendiente/)).toBeInTheDocument()
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(1)
  })

  it('shows the full payment empty state when a sold lot has no installments', async () => {
    server.use(
      saleHandlers.getSaleSuccess({
        ...saleFixtures.detail,
        lots: [
          {
            ...saleFixtures.detail.lots[0],
            downPayment: 250000,
            financedAmount: 0,
            outstandingBalance: 0,
            installmentCount: 0,
            installmentAmount: 0,
            installments: [],
          },
        ],
      }),
    )

    renderSaleDetailPage()

    expect(await screen.findByText('Pago total')).toBeInTheDocument()
    expect(screen.getByText('Este lote no genera mensualidades.')).toBeInTheDocument()
  })

  it('navigates back to the sales history', async () => {
    const user = userEvent.setup()
    server.use(saleHandlers.getSaleSuccess())

    renderSaleDetailPage()
    await screen.findByText('V-2026-0001')

    await user.click(screen.getByRole('button', { name: 'Volver al historial' }))

    expect(screen.getByRole('heading', { name: 'Historial route' })).toBeInTheDocument()
  })
})
