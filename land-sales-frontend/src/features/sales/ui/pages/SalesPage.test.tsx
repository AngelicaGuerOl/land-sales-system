import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createSalePage, saleFixtures, saleHandlers } from '../../../../test/handlers'
import { renderWithProviders } from '../../../../test/render'
import { server } from '../../../../test/server'
import { SalesPage } from './SalesPage'

function renderSalesPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/ventas" element={<SalesPage />} />
      <Route path="/ventas/nueva" element={<h1>Nueva venta route</h1>} />
      <Route path="/ventas/:id" element={<h1>Detalle venta route</h1>} />
    </Routes>,
    { initialEntries: ['/ventas'] },
  )
}

async function selectStatus(option: string) {
  const user = userEvent.setup()
  fireEvent.mouseDown(screen.getByLabelText('Estado'))
  await user.click(screen.getByText(option))
}

describe('SalesPage', () => {
  it('shows the loading state while sales are being fetched', () => {
    server.use(
      http.get('/api/sales', async () => {
        await delay(100)
        return HttpResponse.json(createSalePage())
      }),
    )

    renderSalesPage()

    expect(screen.getByText('Cargando ventas...')).toBeInTheDocument()
  })

  it('shows the empty state when there are no sales', async () => {
    server.use(saleHandlers.getSalesEmpty())

    renderSalesPage()

    expect(await screen.findByText('Sin ventas registradas')).toBeInTheDocument()
    expect(screen.getByText('Ajusta los filtros o registra una nueva venta.')).toBeInTheDocument()
  })

  it('shows sales returned by the API', async () => {
    server.use(saleHandlers.getSalesSuccess())

    renderSalesPage()

    expect(await screen.findByText('V-2026-0001')).toBeInTheDocument()
    expect(screen.getByText('Ana Lopez')).toBeInTheDocument()
    expect(screen.getByText('A-01')).toBeInTheDocument()
    expect(screen.getByText('En pagos')).toBeInTheDocument()
  })

  it('shows an error when the API fails', async () => {
    server.use(saleHandlers.getSalesError())

    renderSalesPage()

    expect(await screen.findByText('No fue posible cargar las ventas.')).toBeInTheDocument()
  })

  it('sends search, status and date filters to the API', async () => {
    const user = userEvent.setup()
    const receivedQueries: string[] = []

    server.use(
      http.get('/api/sales', ({ request }) => {
        receivedQueries.push(new URL(request.url).search)
        return HttpResponse.json(createSalePage([]))
      }),
    )

    renderSalesPage()
    await screen.findByText('Sin ventas registradas')

    await user.type(screen.getByLabelText('Buscar por folio, cliente, teléfono o lote'), 'Ana')
    await selectStatus('Liquidadas')
    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-03-01' } })
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-03-31' } })

    await waitFor(() => {
      expect(receivedQueries.some((query) => query.includes('search=Ana'))).toBe(true)
      expect(receivedQueries.some((query) => query.includes('status=PAID'))).toBe(true)
      expect(receivedQueries.some((query) => query.includes('dateFrom=2026-03-01'))).toBe(true)
      expect(receivedQueries.some((query) => query.includes('dateTo=2026-03-31'))).toBe(true)
    })
  })

  it('clears filters after they are applied', async () => {
    const user = userEvent.setup()
    server.use(saleHandlers.getSalesSuccess())

    renderSalesPage()
    await screen.findByText('V-2026-0001')

    await user.type(screen.getByLabelText('Buscar por folio, cliente, teléfono o lote'), 'Ana')
    expect(await screen.findByRole('button', { name: 'Limpiar filtros' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }))

    expect(screen.getByLabelText('Buscar por folio, cliente, teléfono o lote')).toHaveValue('')
  })

  it('sends pagination changes to the API', async () => {
    const receivedQueries: string[] = []

    server.use(
      http.get('/api/sales', ({ request }) => {
        receivedQueries.push(new URL(request.url).search)
        return HttpResponse.json(createSalePage([saleFixtures.summary], { totalElements: 30, totalPages: 2, last: false }))
      }),
    )

    renderSalesPage()
    await screen.findByText('V-2026-0001')

    await userEvent.click(screen.getByLabelText('Go to next page'))

    await waitFor(() => {
      expect(receivedQueries.some((query) => query.includes('page=1'))).toBe(true)
    })
  })

  it('navigates to the new sale page and detail page', async () => {
    const user = userEvent.setup()
    server.use(saleHandlers.getSalesSuccess())

    renderSalesPage()
    await screen.findByText('V-2026-0001')

    await user.click(screen.getByRole('button', { name: 'Nueva venta' }))
    expect(screen.getByRole('heading', { name: 'Nueva venta route' })).toBeInTheDocument()
  })

  it('navigates to sale detail from the row action', async () => {
    const user = userEvent.setup()
    server.use(saleHandlers.getSalesSuccess())

    renderSalesPage()
    await screen.findByText('V-2026-0001')

    await user.click(screen.getByRole('button', { name: 'Ver detalle de V-2026-0001' }))
    expect(screen.getByRole('heading', { name: 'Detalle venta route' })).toBeInTheDocument()
  })
})
