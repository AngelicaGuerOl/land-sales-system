import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { accountStatementFixtures, accountStatementHandlers, createStatementPage } from '../../../../test/handlers'
import { renderWithProviders } from '../../../../test/render'
import { server } from '../../../../test/server'
import { StatementCustomersPage } from './StatementCustomersPage'

function renderStatementCustomersPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/estado-de-cuenta" element={<StatementCustomersPage />} />
      <Route path="/estado-de-cuenta/:customerId" element={<h1>Detalle estado route</h1>} />
    </Routes>,
    { initialEntries: ['/estado-de-cuenta'] },
  )
}

describe('StatementCustomersPage', () => {
  it('shows the loading state while customers are being fetched', () => {
    server.use(
      http.get('/api/account-statements/customers', async () => {
        await delay(100)
        return HttpResponse.json(createStatementPage())
      }),
    )

    renderStatementCustomersPage()

    expect(screen.getByText('Cargando clientes con cuenta...')).toBeInTheDocument()
  })

  it('shows the empty state when there are no customers with sales', async () => {
    server.use(accountStatementHandlers.getStatementCustomersEmpty())

    renderStatementCustomersPage()

    expect(await screen.findByText('Sin clientes con ventas')).toBeInTheDocument()
    expect(screen.getByText('Los clientes aparecerán aquí cuando tengan una venta registrada.')).toBeInTheDocument()
  })

  it('shows customer statement summaries returned by the API', async () => {
    server.use(accountStatementHandlers.getStatementCustomersSuccess())

    renderStatementCustomersPage()

    expect(await screen.findByText('Ana Lopez')).toBeInTheDocument()
    expect(screen.getByText('5551234567')).toBeInTheDocument()
    expect(screen.getByText('$250,000.00')).toBeInTheDocument()
    expect(screen.getByText('$66,666.67')).toBeInTheDocument()
    expect(screen.getByText('$183,333.33')).toBeInTheDocument()
  })

  it('shows an error when the API fails', async () => {
    server.use(accountStatementHandlers.getStatementCustomersError())

    renderStatementCustomersPage()

    expect(await screen.findByText('No fue posible cargar los estados de cuenta.')).toBeInTheDocument()
  })

  it('sends the typed search to the API after debounce', async () => {
    const user = userEvent.setup()
    const receivedQueries: string[] = []

    server.use(
      http.get('/api/account-statements/customers', ({ request }) => {
        receivedQueries.push(new URL(request.url).search)
        return HttpResponse.json(createStatementPage([]))
      }),
    )

    renderStatementCustomersPage()
    await screen.findByText('Sin clientes con ventas')

    await user.type(screen.getByLabelText('Buscar por nombre o teléfono'), 'Ana')

    await waitFor(() => {
      expect(receivedQueries.some((query) => query.includes('search=Ana'))).toBe(true)
    })
  })

  it('sends pagination changes to the API', async () => {
    const receivedQueries: string[] = []

    server.use(
      http.get('/api/account-statements/customers', ({ request }) => {
        receivedQueries.push(new URL(request.url).search)
        return HttpResponse.json(createStatementPage([accountStatementFixtures.summary], { totalElements: 30, totalPages: 2, last: false }))
      }),
    )

    renderStatementCustomersPage()
    await screen.findByText('Ana Lopez')

    await userEvent.click(screen.getByLabelText('Go to next page'))

    await waitFor(() => {
      expect(receivedQueries.some((query) => query.includes('page=1'))).toBe(true)
    })
  })

  it('navigates to the selected customer statement', async () => {
    const user = userEvent.setup()
    server.use(accountStatementHandlers.getStatementCustomersSuccess())

    renderStatementCustomersPage()
    await screen.findByText('Ana Lopez')

    await user.click(screen.getByRole('button', { name: 'Ver estado de cuenta de Ana Lopez' }))

    expect(screen.getByRole('heading', { name: 'Detalle estado route' })).toBeInTheDocument()
  })
})
