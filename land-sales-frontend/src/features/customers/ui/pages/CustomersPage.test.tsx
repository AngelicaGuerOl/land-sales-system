import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, delay } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import {
  createCustomerPage,
  customerFixtures,
  customerHandlers,
} from '../../../../test/handlers'
import { renderWithProviders } from '../../../../test/render'
import { server } from '../../../../test/server'
import { CustomersPage } from './CustomersPage'

vi.mock('../components/CustomerTable', () => {
  type MockCustomer = {
    id: number
    fullName: string
    phone: string
    active: boolean
    alternatePhone: string | null
    address: string | null
    createdAt: string
    updatedAt: string
  }

  type MockCustomerTableProps = {
    customers: MockCustomer[]
    onSelect(customer: MockCustomer): void
    onEdit(customer: MockCustomer): void
    onStatus(customer: MockCustomer, active: boolean): void
  }

  return {
    CustomerTable({ customers, onEdit, onStatus }: MockCustomerTableProps) {
      return (
        <section aria-label="Tabla de clientes">
          {customers.map((customer) => (
            <article key={customer.id}>
              <h3>{customer.fullName}</h3>
              <p>{customer.phone}</p>
              <button type="button" onClick={() => onEdit(customer)}>
                Editar a {customer.fullName}
              </button>
              <button type="button" onClick={() => onStatus(customer, !customer.active)}>
                {customer.active ? 'Desactivar' : 'Activar'} a {customer.fullName}
              </button>
            </article>
          ))}
        </section>
      )
    },
  }
})

function renderCustomersPage() {
  return renderWithProviders(<CustomersPage />)
}

function getButton(name: string) {
  const button = screen.getByText(name).closest('button')
  expect(button).not.toBeNull()
  return button as HTMLButtonElement
}

describe('CustomersPage', () => {
  it('shows the loading state while customers are being fetched', () => {
    server.use(
      http.get('/api/customers', async () => {
        await delay(100)
        return HttpResponse.json(createCustomerPage())
      }),
    )

    renderCustomersPage()

    expect(screen.getByText('Actualizando...')).toBeInTheDocument()
    expect(screen.getByText('Cargando clientes...')).toBeInTheDocument()
  })

  it('shows the empty state when the API returns no customers', async () => {
    server.use(customerHandlers.getCustomersEmpty())

    renderCustomersPage()

    expect(await screen.findByText('Sin resultados')).toBeInTheDocument()
    expect(screen.getByText('Ajusta la búsqueda o el estado seleccionado.')).toBeInTheDocument()
    expect(screen.getByText('0 resultado(s)')).toBeInTheDocument()
  })

  it('shows customers returned by the API', async () => {
    server.use(customerHandlers.getCustomersSuccess())

    renderCustomersPage()

    expect(await screen.findByRole('heading', { name: 'Ana Lopez' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Bruno Perez' })).toBeInTheDocument()
    expect(screen.getByText('2 resultado(s)')).toBeInTheDocument()
  })

  it('shows an error state when the customers query fails', async () => {
    server.use(customerHandlers.getCustomersError())

    renderCustomersPage()

    expect(await screen.findByText('No fue posible cargar los clientes.')).toBeInTheDocument()
  })

  it('sends the typed search criteria after the configured debounce', async () => {
    const user = userEvent.setup()
    const receivedSearches: string[] = []

    server.use(
      http.get('/api/customers', ({ request }) => {
        receivedSearches.push(new URL(request.url).searchParams.get('search') ?? '')
        return HttpResponse.json(createCustomerPage([]))
      }),
    )

    renderCustomersPage()
    await screen.findByText('Sin resultados')

    await user.type(screen.getByPlaceholderText('Buscar por nombre o teléfono'), ' Ana ')

    await waitFor(() => {
      expect(receivedSearches).toContain('Ana')
    })
  })

  it('opens the form to create a customer', async () => {
    const user = userEvent.setup()
    server.use(customerHandlers.getCustomersEmpty())

    renderCustomersPage()
    await screen.findByText('Sin resultados')

    await user.click(getButton('Registrar cliente'))

    expect(screen.getAllByText('Registrar cliente')).toHaveLength(2)
    expect(screen.getByLabelText(/Nombre completo/i)).toBeInTheDocument()
  })

  it('creates a customer and refreshes the list after success', async () => {
    const user = userEvent.setup()
    let listRequests = 0
    let receivedBody: unknown

    server.use(
      http.get('/api/customers', () => {
        listRequests += 1
        return HttpResponse.json(createCustomerPage([]))
      }),
      http.post('/api/customers', async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json(customerFixtures.active, { status: 201 })
      }),
    )

    renderCustomersPage()
    await screen.findByText('Sin resultados')

    await user.click(getButton('Registrar cliente'))
    await user.type(screen.getByLabelText(/Nombre completo/i), '  Ana Lopez  ')
    await user.type(screen.getByLabelText(/Teléfono principal/i), '5551234567')

    await waitFor(() => {
      expect(getButton('Guardar cliente')).toBeEnabled()
    })
    await user.click(getButton('Guardar cliente'))

    expect(await screen.findByText('Cliente guardado correctamente.')).toBeInTheDocument()
    expect(receivedBody).toEqual({
      fullName: 'Ana Lopez',
      phone: '5551234567',
      alternatePhone: null,
      address: null,
    })
    await waitFor(() => {
      expect(listRequests).toBeGreaterThan(1)
    })
  })

  it('opens the form to edit a customer and sends the update to the customer endpoint', async () => {
    const user = userEvent.setup()
    let updatedId: string | readonly string[] | undefined
    let receivedBody: unknown

    server.use(
      customerHandlers.getCustomersSuccess(createCustomerPage([customerFixtures.active])),
      http.put('/api/customers/:id', async ({ params, request }) => {
        updatedId = params.id
        receivedBody = await request.json()
        return HttpResponse.json({ ...customerFixtures.active, fullName: 'Ana Editada' })
      }),
    )

    renderCustomersPage()
    await screen.findByText('Ana Lopez')

    await user.click(getButton('Editar a Ana Lopez'))
    expect(screen.getByText('Editar cliente')).toBeInTheDocument()

    await user.clear(screen.getByLabelText(/Nombre completo/i))
    await user.type(screen.getByLabelText(/Nombre completo/i), 'Ana Editada')
    await user.click(getButton('Guardar cambios'))

    expect(await screen.findByText('Cliente guardado correctamente.')).toBeInTheDocument()
    expect(updatedId).toBe('1')
    expect(receivedBody).toEqual({
      fullName: 'Ana Editada',
      phone: '5551234567',
      alternatePhone: null,
      address: 'Calle Norte 100',
    })
  })

  it('changes customer status and refreshes queries after success', async () => {
    const user = userEvent.setup()
    let listRequests = 0
    let changedId: string | readonly string[] | undefined
    let receivedBody: unknown

    server.use(
      http.get('/api/customers', () => {
        listRequests += 1
        return HttpResponse.json(createCustomerPage([customerFixtures.active]))
      }),
      http.patch('/api/customers/:id/status', async ({ params, request }) => {
        changedId = params.id
        receivedBody = await request.json()
        return HttpResponse.json({ ...customerFixtures.active, active: false })
      }),
    )

    renderCustomersPage()
    await screen.findByText('Ana Lopez')

    await user.click(getButton('Desactivar a Ana Lopez'))
    expect(screen.getByText('Desactivar cliente')).toBeInTheDocument()

    await user.click(getButton('Desactivar'))

    expect(await screen.findByText('Cliente desactivado correctamente.')).toBeInTheDocument()
    expect(changedId).toBe('1')
    expect(receivedBody).toEqual({ active: false })
    await waitFor(() => {
      expect(listRequests).toBeGreaterThan(1)
    })
  })

  it('shows the application error when a customer operation fails', async () => {
    const user = userEvent.setup()

    server.use(
      customerHandlers.getCustomersSuccess(createCustomerPage([customerFixtures.active])),
      http.put('/api/customers/:id', () => {
        return HttpResponse.json(
          { message: 'El teléfono ya está registrado.' },
          { status: 409 },
        )
      }),
    )

    renderCustomersPage()
    await screen.findByText('Ana Lopez')

    await user.click(getButton('Editar a Ana Lopez'))
    await user.clear(screen.getByLabelText(/Teléfono principal/i))
    await user.type(screen.getByLabelText(/Teléfono principal/i), '5550000000')
    await user.click(getButton('Guardar cambios'))

    expect(await screen.findByText('El teléfono ya está registrado.')).toBeInTheDocument()
  })
})
