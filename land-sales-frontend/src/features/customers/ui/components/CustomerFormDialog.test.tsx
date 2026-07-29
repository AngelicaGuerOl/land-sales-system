import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { customerFixtures } from '../../../../test/handlers'
import { renderWithProviders } from '../../../../test/render'
import type { Customer } from '../../domain/entities/Customer'
import { CustomerFormDialog } from './CustomerFormDialog'

function renderCustomerFormDialog({
  customer = null,
  pending = false,
  onClose = vi.fn(),
  onSubmit = vi.fn(),
}: {
  customer?: Customer | null
  pending?: boolean
  onClose?: () => void
  onSubmit?: Parameters<typeof CustomerFormDialog>[0]['onSubmit']
} = {}) {
  const result = renderWithProviders(
    <CustomerFormDialog
      open
      customer={customer}
      pending={pending}
      onClose={onClose}
      onSubmit={onSubmit}
    />,
  )

  return { ...result, onClose, onSubmit }
}

function getButton(name: string) {
  const button = screen.getByText(name).closest('button')
  expect(button).not.toBeNull()
  return button as HTMLButtonElement
}

async function fillRequiredCustomerFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Nombre completo/i), '  Laura Martinez  ')
  await user.type(screen.getByLabelText(/Teléfono principal/i), ' 5551234567 ')
}

describe('CustomerFormDialog', () => {
  it('renders the main fields and actions for customer creation', () => {
    renderCustomerFormDialog()

    expect(screen.getByText('Registrar cliente')).toBeInTheDocument()
    expect(screen.getByLabelText(/Nombre completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Teléfono principal/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Teléfono alternativo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Domicilio completo/i)).toBeInTheDocument()
    expect(getButton('Cancelar')).toBeInTheDocument()
    expect(getButton('Guardar cliente')).toBeDisabled()
  })

  it('shows validation messages when required fields become empty', async () => {
    const user = userEvent.setup()
    renderCustomerFormDialog()

    await user.type(screen.getByLabelText(/Nombre completo/i), 'Cliente temporal')
    await user.clear(screen.getByLabelText(/Nombre completo/i))
    await user.type(screen.getByLabelText(/Teléfono principal/i), '5551234567')
    await user.clear(screen.getByLabelText(/Teléfono principal/i))

    expect(await screen.findByText('El nombre completo es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('El teléfono principal es obligatorio.')).toBeInTheDocument()
    expect(getButton('Guardar cliente')).toBeDisabled()
  })

  it('submits normalized values when creating a customer', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderCustomerFormDialog({ onSubmit })

    await fillRequiredCustomerFields(user)
    await user.type(screen.getByLabelText(/Teléfono alternativo/i), ' ')
    await user.type(screen.getByLabelText(/Domicilio completo/i), '  Calle Sur 200  ')

    await waitFor(() => {
      expect(getButton('Guardar cliente')).toBeEnabled()
    })
    await user.click(getButton('Guardar cliente'))

    expect(onSubmit).toHaveBeenCalledWith({
      fullName: 'Laura Martinez',
      phone: '5551234567',
      alternatePhone: null,
      address: 'Calle Sur 200',
    })
  })

  it('loads existing customer data when editing', async () => {
    renderCustomerFormDialog({ customer: customerFixtures.inactive })

    expect(screen.getByText('Editar cliente')).toBeInTheDocument()
    expect(screen.getByLabelText(/Nombre completo/i)).toHaveValue('Bruno Perez')
    expect(screen.getByLabelText(/Teléfono principal/i)).toHaveValue('5557654321')
    expect(screen.getByLabelText(/Teléfono alternativo/i)).toHaveValue('5551112222')
    expect(screen.getByLabelText(/Domicilio completo/i)).toHaveValue('')
    await waitFor(() => {
      expect(getButton('Guardar cambios')).toBeEnabled()
    })
  })

  it('submits the edit values without adding an id to the form payload', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderCustomerFormDialog({ customer: customerFixtures.active, onSubmit })

    await user.clear(screen.getByLabelText(/Nombre completo/i))
    await user.type(screen.getByLabelText(/Nombre completo/i), '  Ana Actualizada  ')
    await user.click(getButton('Guardar cambios'))

    expect(onSubmit).toHaveBeenCalledWith({
      fullName: 'Ana Actualizada',
      phone: '5551234567',
      alternatePhone: null,
      address: 'Calle Norte 100',
    })
  })

  it('disables fields and actions while saving', () => {
    renderCustomerFormDialog({ customer: customerFixtures.active, pending: true })

    expect(screen.getByLabelText(/Nombre completo/i)).toBeDisabled()
    expect(screen.getByLabelText(/Teléfono principal/i)).toBeDisabled()
    expect(getButton('Cancelar')).toBeDisabled()
    expect(getButton('Guardando...')).toBeDisabled()
  })

  it('calls onClose when cancelling', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderCustomerFormDialog({ onClose })

    await user.click(getButton('Cancelar'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
