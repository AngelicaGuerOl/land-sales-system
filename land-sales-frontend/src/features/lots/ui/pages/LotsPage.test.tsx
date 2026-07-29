import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { lotFixtures, lotHandlers } from '../../../../test/handlers'
import { renderWithProviders } from '../../../../test/render'
import { server } from '../../../../test/server'
import { LotsPage } from './LotsPage'

vi.mock('../components/LotTable', () => {
  type MockLot = {
    id: number
    code: string
    blockCode: string
    lotNumber: string
    status: 'AVAILABLE' | 'SOLD' | 'BLOCKED'
    version: number
  }

  type MockLotTableProps = {
    lots: MockLot[]
    onSelect(lot: MockLot): void
    onEdit(lot: MockLot): void
    onStatus(lot: MockLot, status: 'AVAILABLE' | 'BLOCKED'): void
  }

  return {
    LotTable({ lots, onSelect, onEdit, onStatus }: MockLotTableProps) {
      return (
        <section aria-label="Tabla de lotes">
          {lots.map((lot) => (
            <article key={lot.id}>
              <h3>{lot.code}</h3>
              <p>{lot.blockCode}</p>
              <p>{lot.lotNumber}</p>
              <p>{lot.status}</p>
              <button type="button" onClick={() => onSelect(lot)}>
                Ver detalle de {lot.code}
              </button>
              <button type="button" onClick={() => onEdit(lot)}>
                Editar {lot.code}
              </button>
              {lot.status === 'AVAILABLE' ? (
                <button type="button" onClick={() => onStatus(lot, 'BLOCKED')}>
                  Bloquear {lot.code}
                </button>
              ) : null}
              {lot.status === 'BLOCKED' ? (
                <button type="button" onClick={() => onStatus(lot, 'AVAILABLE')}>
                  Desbloquear {lot.code}
                </button>
              ) : null}
            </article>
          ))}
        </section>
      )
    },
  }
})

function renderLotsPage(initialEntries?: string[]) {
  return renderWithProviders(<LotsPage />, { initialEntries })
}

function getButton(name: string) {
  const button = screen.getByText(name).closest('button')
  expect(button).not.toBeNull()
  return button as HTMLButtonElement
}

function setField(label: string | RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

async function selectMuiOption(label: string, option: string) {
  const user = userEvent.setup()
  const fields = screen.getAllByLabelText(label)
  fireEvent.mouseDown(fields[fields.length - 1])
  await user.click(screen.getByText(option))
}

function useDefaultCatalogHandlers() {
  server.use(lotHandlers.getBlocksSuccess())
}

describe('LotsPage', () => {
  it('shows the loading state while lots are being fetched', () => {
    useDefaultCatalogHandlers()
    server.use(
      http.get('/api/lots', async () => {
        await delay(100)
        return HttpResponse.json([lotFixtures.available])
      }),
    )

    renderLotsPage()

    expect(screen.getByText('Actualizando...')).toBeInTheDocument()
    expect(screen.getByText('Cargando lotes...')).toBeInTheDocument()
  })

  it('shows the empty state when the API returns no lots', async () => {
    useDefaultCatalogHandlers()
    server.use(lotHandlers.getLotsEmpty())

    renderLotsPage()

    expect(await screen.findByText('Sin resultados')).toBeInTheDocument()
    expect(screen.getByText('Ajusta la búsqueda, manzana o estado seleccionado.')).toBeInTheDocument()
    expect(screen.getByText('0 resultado(s)')).toBeInTheDocument()
  })

  it('shows lots returned by the API', async () => {
    useDefaultCatalogHandlers()
    server.use(lotHandlers.getLotsSuccess())

    renderLotsPage()

    expect(await screen.findByText('A-01')).toBeInTheDocument()
    expect(screen.getByText('A-02')).toBeInTheDocument()
    expect(screen.getByText('B-03')).toBeInTheDocument()
    expect(screen.getByText('3 resultado(s)')).toBeInTheDocument()
  })

  it('shows an error state when the lots query fails', async () => {
    useDefaultCatalogHandlers()
    server.use(lotHandlers.getLotsError())

    renderLotsPage()

    expect(await screen.findByText('No fue posible cargar los lotes.')).toBeInTheDocument()
  })

  it('shows an error when block options cannot be loaded', async () => {
    server.use(lotHandlers.getBlocksError(), lotHandlers.getLotsEmpty())

    renderLotsPage()

    expect(await screen.findByText('No fue posible cargar las manzanas.')).toBeInTheDocument()
  })

  it('sends the search criteria typed by the user', async () => {
    const user = userEvent.setup()
    const receivedSearches: string[] = []

    useDefaultCatalogHandlers()
    server.use(
      http.get('/api/lots', ({ request }) => {
        receivedSearches.push(new URL(request.url).searchParams.get('search') ?? '')
        return HttpResponse.json([])
      }),
    )

    renderLotsPage()
    await screen.findByText('Sin resultados')

    await user.type(screen.getByLabelText('Código o número'), 'A-01')

    await waitFor(() => {
      expect(receivedSearches).toContain('A-01')
    })
  })

  it('sends selected block and status filters', async () => {
    const receivedQueries: string[] = []

    useDefaultCatalogHandlers()
    server.use(
      http.get('/api/lots', ({ request }) => {
        receivedQueries.push(new URL(request.url).search)
        return HttpResponse.json([])
      }),
    )

    renderLotsPage()
    await screen.findByText('Sin resultados')

    await selectMuiOption('Manzana', 'A')
    await selectMuiOption('Estado', 'Bloqueado')

    await waitFor(() => {
      expect(receivedQueries.some((query) => query.includes('blockId=10'))).toBe(true)
      expect(receivedQueries.some((query) => query.includes('status=BLOCKED'))).toBe(true)
    })
  })

  it('uses the blockId query parameter as initial filter', async () => {
    const receivedQueries: string[] = []

    useDefaultCatalogHandlers()
    server.use(
      http.get('/api/lots', ({ request }) => {
        receivedQueries.push(new URL(request.url).search)
        return HttpResponse.json([])
      }),
    )

    renderLotsPage(['/lotes?blockId=11'])

    await waitFor(() => {
      expect(receivedQueries.some((query) => query.includes('blockId=11'))).toBe(true)
    })
  })

  it('opens the form to create a lot', async () => {
    const user = userEvent.setup()
    useDefaultCatalogHandlers()
    server.use(lotHandlers.getLotsEmpty())

    renderLotsPage()
    await screen.findByText('Sin resultados')

    await user.click(getButton('Registrar lote'))

    expect(screen.getAllByText('Registrar lote')).toHaveLength(2)
    expect(screen.getAllByLabelText('Manzana').length).toBeGreaterThan(1)
  })

  it('creates a lot and refreshes the list after success', async () => {
    const user = userEvent.setup()
    let listRequests = 0
    let receivedBody: unknown

    useDefaultCatalogHandlers()
    server.use(
      http.get('/api/lots', () => {
        listRequests += 1
        return HttpResponse.json([])
      }),
      http.post('/api/lots', async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json(lotFixtures.available, { status: 201 })
      }),
    )

    renderLotsPage()
    await screen.findByText('Sin resultados')

    await user.click(getButton('Registrar lote'))
    await selectMuiOption('Manzana', 'A')
    setField('Número', '01')
    setField('Superficie (m²)', '120')
    setField('Precio', '250000')
    await user.click(getButton('Guardar'))

    expect(await screen.findByText('Lote guardado correctamente.')).toBeInTheDocument()
    expect(receivedBody).toEqual({
      blockId: 10,
      lotNumber: '01',
      code: 'A-01',
      areaM2: 120,
      frontMeters: null,
      depthMeters: null,
      currentPrice: 250000,
      locationReference: null,
      notes: null,
    })
    await waitFor(() => {
      expect(listRequests).toBeGreaterThan(1)
    })
  })

  it('opens the form to edit a lot and sends the update payload', async () => {
    const user = userEvent.setup()
    let updatedId: string | readonly string[] | undefined
    let receivedBody: unknown

    useDefaultCatalogHandlers()
    server.use(
      lotHandlers.getLotsSuccess([lotFixtures.available]),
      http.put('/api/lots/:id', async ({ params, request }) => {
        updatedId = params.id
        receivedBody = await request.json()
        return HttpResponse.json({ ...lotFixtures.available, notes: 'Nota editada' })
      }),
    )

    renderLotsPage()
    await screen.findByText('A-01')

    await user.click(getButton('Editar A-01'))
    expect(screen.getAllByText('Editar A-01')).toHaveLength(2)
    setField('Observaciones', 'Nota editada')
    await user.click(getButton('Guardar'))

    expect(await screen.findByText('Lote guardado correctamente.')).toBeInTheDocument()
    expect(updatedId).toBe('101')
    expect(receivedBody).toEqual({
      blockId: 10,
      lotNumber: '01',
      code: 'A-01',
      areaM2: 120,
      frontMeters: 8,
      depthMeters: 15,
      currentPrice: 250000,
      locationReference: 'Frente al parque',
      notes: 'Nota editada',
      version: 3,
    })
  })

  it('sends price change reason when editing the price', async () => {
    const user = userEvent.setup()
    let receivedBody: unknown

    useDefaultCatalogHandlers()
    server.use(
      lotHandlers.getLotsSuccess([lotFixtures.available]),
      http.put('/api/lots/:id', async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json({ ...lotFixtures.available, price: 275000, version: 4 })
      }),
    )

    renderLotsPage()
    await screen.findByText('A-01')

    await user.click(getButton('Editar A-01'))
    setField('Precio', '275000')
    expect(await screen.findByLabelText(/Motivo del cambio de precio/i)).toBeInTheDocument()
    setField(/Motivo del cambio de precio/i, 'Ajuste de mercado')
    await user.click(getButton('Guardar'))

    expect(await screen.findByText('Lote guardado correctamente.')).toBeInTheDocument()
    expect(receivedBody).toEqual(expect.objectContaining({
      currentPrice: 275000,
      priceChangeReason: 'Ajuste de mercado',
      version: 3,
    }))
  })

  it('opens lot detail with price history', async () => {
    const user = userEvent.setup()
    useDefaultCatalogHandlers()
    server.use(
      lotHandlers.getLotsSuccess([lotFixtures.available]),
      lotHandlers.getLotSuccess(lotFixtures.available),
      lotHandlers.getPriceHistorySuccess(),
    )

    renderLotsPage()
    await screen.findByText('A-01')

    await user.click(getButton('Ver detalle de A-01'))

    expect(await screen.findByText('Detalle del lote')).toBeInTheDocument()
    expect(screen.getAllByText('A-01').length).toBeGreaterThan(0)
    expect(screen.getByText('Historial de precios')).toBeInTheDocument()
    expect(screen.getByText('Ajuste comercial ficticio')).toBeInTheDocument()
  })

  it('blocks an available lot after confirmation and refreshes the list', async () => {
    const user = userEvent.setup()
    let listRequests = 0
    let changedId: string | readonly string[] | undefined
    let receivedBody: unknown

    useDefaultCatalogHandlers()
    server.use(
      http.get('/api/lots', () => {
        listRequests += 1
        return HttpResponse.json([lotFixtures.available])
      }),
      http.patch('/api/lots/:id/status', async ({ params, request }) => {
        changedId = params.id
        receivedBody = await request.json()
        return HttpResponse.json({ ...lotFixtures.available, status: 'BLOCKED', version: 4 })
      }),
    )

    renderLotsPage()
    await screen.findByText('A-01')

    await user.click(getButton('Bloquear A-01'))
    expect(screen.getByText('Bloquear lote')).toBeInTheDocument()
    expect(screen.getByText('¿Confirmas bloquear el lote A-01?')).toBeInTheDocument()
    await user.click(getButton('Bloquear'))

    expect(await screen.findByText('Lote bloqueado correctamente.')).toBeInTheDocument()
    expect(changedId).toBe('101')
    expect(receivedBody).toEqual({ status: 'BLOCKED', version: 3 })
    await waitFor(() => {
      expect(listRequests).toBeGreaterThan(1)
    })
  })

  it('unblocks a blocked lot after confirmation', async () => {
    const user = userEvent.setup()
    let receivedBody: unknown

    useDefaultCatalogHandlers()
    server.use(
      lotHandlers.getLotsSuccess([lotFixtures.blocked]),
      http.patch('/api/lots/:id/status', async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json({ ...lotFixtures.blocked, status: 'AVAILABLE', version: 5 })
      }),
    )

    renderLotsPage()
    await screen.findByText('A-02')

    await user.click(getButton('Desbloquear A-02'))
    expect(screen.getByText('Desbloquear lote')).toBeInTheDocument()
    await user.click(getButton('Desbloquear'))

    expect(await screen.findByText('Lote desbloqueado correctamente.')).toBeInTheDocument()
    expect(receivedBody).toEqual({ status: 'AVAILABLE', version: 4 })
  })

  it('does not expose status actions for sold lots', async () => {
    useDefaultCatalogHandlers()
    server.use(lotHandlers.getLotsSuccess([lotFixtures.sold]))

    renderLotsPage()
    await screen.findByText('B-03')

    expect(screen.queryByText('Bloquear B-03')).not.toBeInTheDocument()
    expect(screen.queryByText('Desbloquear B-03')).not.toBeInTheDocument()
  })

  it('shows the backend message when a lot operation fails', async () => {
    const user = userEvent.setup()

    useDefaultCatalogHandlers()
    server.use(
      lotHandlers.getLotsSuccess([lotFixtures.available]),
      http.put('/api/lots/:id', () => lotHandlers.conflict('El código del lote ya existe.')),
    )

    renderLotsPage()
    await screen.findByText('A-01')

    await user.click(getButton('Editar A-01'))
    setField('Código', 'A-99')
    await user.click(getButton('Guardar'))

    expect(await screen.findByText('El código del lote ya existe.')).toBeInTheDocument()
  })
})
