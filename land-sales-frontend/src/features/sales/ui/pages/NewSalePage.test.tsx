import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { lotHandlers, saleFixtures, saleHandlers } from '../../../../test/handlers'
import { renderWithProviders } from '../../../../test/render'
import { server } from '../../../../test/server'
import { NewSalePage } from './NewSalePage'

function renderNewSalePage() {
  return renderWithProviders(
    <Routes>
      <Route path="/ventas" element={<h1>Historial route</h1>} />
      <Route path="/ventas/nueva" element={<NewSalePage />} />
      <Route path="/ventas/:id" element={<h1>Venta creada route</h1>} />
    </Routes>,
    { initialEntries: ['/ventas/nueva'] },
  )
}

function setField(label: string | RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

function getButton(name: string) {
  const button = screen.getAllByText(name).map((element) => element.closest('button')).find(Boolean)
  expect(button).toBeDefined()
  return button as HTMLButtonElement
}

function getLastButton(name: string) {
  const buttons = screen.getAllByText(name).map((element) => element.closest('button')).filter(Boolean)
  expect(buttons.length).toBeGreaterThan(0)
  return buttons[buttons.length - 1] as HTMLButtonElement
}

function useDefaultNewSaleHandlers() {
  server.use(
    saleHandlers.getCustomersSuccess(),
    lotHandlers.getBlocksSuccess(),
    saleHandlers.getAvailableLotsSuccess(),
  )
}

async function selectCustomer(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Buscar cliente activo'), 'Ana')
  await user.click(await screen.findByText('Ana Lopez'))
}

async function goToLotSelection(user: ReturnType<typeof userEvent.setup>) {
  await selectCustomer(user)
  await user.click(getButton('Continuar'))
  expect(await screen.findByText('0 lotes seleccionados')).toBeInTheDocument()
}

async function selectFirstLotAndGoToPayment(user: ReturnType<typeof userEvent.setup>) {
  await goToLotSelection(user)
  await user.click(await screen.findByText('A-01'))
  expect(screen.getByText('1 lote seleccionado')).toBeInTheDocument()
  await user.click(getButton('Continuar'))
  expect(await screen.findByText('Precio actual: $250,000.00')).toBeInTheDocument()
}

describe('NewSalePage', () => {
  it('renders the initial customer step and navigates back to sales history', async () => {
    const user = userEvent.setup()
    useDefaultNewSaleHandlers()

    renderNewSalePage()

    expect(screen.getByText('Nueva venta')).toBeInTheDocument()
    expect(screen.getByLabelText('Buscar cliente activo')).toBeInTheDocument()
    expect(screen.getByText('Busca al menos dos caracteres para consultar clientes activos.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Historial de ventas' }))
    expect(screen.getByRole('heading', { name: 'Historial route' })).toBeInTheDocument()
  })

  it('queries active customers with the typed search and selects one', async () => {
    const user = userEvent.setup()
    const receivedQueries: string[] = []

    server.use(
      http.get('/api/customers', ({ request }) => {
        receivedQueries.push(new URL(request.url).search)
        return HttpResponse.json({
          content: [saleFixtures.customer],
          page: 0,
          size: 20,
          totalElements: 1,
          totalPages: 1,
          first: true,
          last: true,
        })
      }),
      lotHandlers.getBlocksSuccess(),
      saleHandlers.getAvailableLotsSuccess(),
    )

    renderNewSalePage()

    await selectCustomer(user)

    expect(screen.getByText('5551234567 · Calle Norte 100')).toBeInTheDocument()
    expect(receivedQueries.some((query) => query.includes('active=true'))).toBe(true)
    expect(receivedQueries.some((query) => query.includes('search=Ana'))).toBe(true)
  })

  it('shows available lots and filters them by block and search', async () => {
    const user = userEvent.setup()
    const receivedQueries: string[] = []

    server.use(
      saleHandlers.getCustomersSuccess(),
      lotHandlers.getBlocksSuccess(),
      http.get('/api/lots', ({ request }) => {
        receivedQueries.push(new URL(request.url).search)
        return HttpResponse.json([saleFixtures.availableLot])
      }),
    )

    renderNewSalePage()
    await goToLotSelection(user)

    expect(await screen.findByText('A-01')).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByLabelText('Manzana'))
    await user.click(screen.getByText('A'))
    setField('Buscar por código o número', 'A-01')

    await waitFor(() => {
      expect(receivedQueries.some((query) => query.includes('status=AVAILABLE'))).toBe(true)
      expect(receivedQueries.some((query) => query.includes('blockId=10'))).toBe(true)
      expect(receivedQueries.some((query) => query.includes('search=A-01'))).toBe(true)
    })
  })

  it('disables continuing from lot selection until at least one lot is selected', async () => {
    const user = userEvent.setup()
    useDefaultNewSaleHandlers()

    renderNewSalePage()
    await goToLotSelection(user)

    expect(getButton('Continuar')).toBeDisabled()
  })

  it('creates a sale with the real payload and navigates to the created detail', async () => {
    const user = userEvent.setup()
    let receivedBody: unknown

    server.use(
      saleHandlers.getCustomersSuccess(),
      lotHandlers.getBlocksSuccess(),
      saleHandlers.getAvailableLotsSuccess(),
      http.post('/api/sales', async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json(saleFixtures.detail, { status: 201 })
      }),
    )

    renderNewSalePage()
    await selectFirstLotAndGoToPayment(user)

    setField('Precio acordado', '250000')
    setField('Enganche', '50000')
    setField('Mensualidades', '12')
    await user.click(getButton('Continuar'))

    expect(await screen.findByText('Resumen de la venta')).toBeInTheDocument()
    expect(screen.getByText(/Cliente:/)).toBeInTheDocument()
    expect(screen.getByText(/Lotes seleccionados: 1/)).toBeInTheDocument()

    await user.click(getButton('Confirmar venta'))
    expect(screen.getByText('Al confirmar, los lotes seleccionados cambiarán a vendidos y se generará su plan mensual. Esta operación no podrá editarse directamente.')).toBeInTheDocument()
    await user.click(getLastButton('Confirmar venta'))

    await waitFor(() => {
      expect(receivedBody).toMatchObject({
        customerId: 1,
        lots: [
          {
            lotId: 101,
            agreedPrice: 250000,
            downPayment: 50000,
            installmentCount: 12,
          },
        ],
      })
      expect(typeof (receivedBody as { saleDate?: unknown }).saleDate).toBe('string')
    })
    expect(await screen.findByRole('heading', { name: 'Venta creada route' })).toBeInTheDocument()
  })

  it('shows validation for payment conditions before confirming', async () => {
    const user = userEvent.setup()
    useDefaultNewSaleHandlers()

    renderNewSalePage()
    await selectFirstLotAndGoToPayment(user)

    setField('Enganche', '260000')
    await user.click(getButton('Continuar'))

    expect(await screen.findByText('El enganche no puede superar el precio.')).toBeInTheDocument()
  })

  it('shows the backend error and returns to lot selection when creation fails', async () => {
    const user = userEvent.setup()

    server.use(
      saleHandlers.getCustomersSuccess(),
      lotHandlers.getBlocksSuccess(),
      saleHandlers.getAvailableLotsSuccess(),
      http.post('/api/sales', () => {
        return HttpResponse.json({ message: 'El lote ya no está disponible.' }, { status: 409 })
      }),
    )

    renderNewSalePage()
    await selectFirstLotAndGoToPayment(user)

    await user.click(getButton('Continuar'))
    await screen.findByText('Resumen de la venta')
    await user.click(getButton('Confirmar venta'))
    await user.click(getLastButton('Confirmar venta'))

    expect(await screen.findByText('El lote ya no está disponible.')).toBeInTheDocument()
    expect(screen.getByText('1 lote seleccionado')).toBeInTheDocument()
  })
})
