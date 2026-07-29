import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { accountStatementFixtures, paymentFixtures } from '../../../../test/handlers'
import { renderWithProviders } from '../../../../test/render'
import { server } from '../../../../test/server'
import { RegisterPaymentDialog } from './RegisterPaymentDialog'

function renderRegisterPaymentDialog(overrides: Partial<Parameters<typeof RegisterPaymentDialog>[0]> = {}) {
  const props = {
    open: true,
    statement: accountStatementFixtures.detail,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    onOpenReceipt: vi.fn(),
    ...overrides,
  }

  renderWithProviders(<RegisterPaymentDialog {...props} />)

  return props
}

async function selectPaymentMethod(option: string) {
  const user = userEvent.setup()
  fireEvent.mouseDown(document.querySelector('[role="combobox"]') as HTMLElement)
  await user.click(screen.getByText(option))
}

function getButton(name: string) {
  const button = [...document.querySelectorAll('button')].find((element) => element.textContent?.includes(name))
  expect(button).toBeDefined()
  return button as HTMLButtonElement
}

describe('RegisterPaymentDialog', () => {
  it('renders payment method, pending installments and disabled review action initially', () => {
    renderRegisterPaymentDialog()

    expect(screen.getByText('Registrar pago')).toBeInTheDocument()
    expect(screen.getByText('Ana Lopez · 5551234567')).toBeInTheDocument()
    expect(screen.getByText('A-01')).toBeInTheDocument()
    expect(screen.getByLabelText('1. abril de 2026')).toBeInTheDocument()
    expect(getButton('Revisar pago')).toBeDisabled()
    expect(screen.getByText('Total del pago: $0.00')).toBeInTheDocument()
  })

  it('shows the transfer reference field when transfer is selected', async () => {
    renderRegisterPaymentDialog()

    await selectPaymentMethod('Transferencia')

    expect(screen.getByLabelText('Referencia (opcional)')).toBeInTheDocument()
  })

  it('validates the editable amount before allowing review', async () => {
    const user = userEvent.setup()
    renderRegisterPaymentDialog()

    await user.click(screen.getByLabelText('1. abril de 2026'))
    const amountInput = screen.getByLabelText('Monto a aplicar para la mensualidad 1')
    await user.clear(amountInput)
    await user.type(amountInput, '0')

    expect(screen.getByText('Ingresa un monto válido.')).toBeInTheDocument()
    expect(getButton('Revisar pago')).toBeDisabled()
  })

  it('sends transfer reference and selected installments when the user confirms', async () => {
    const user = userEvent.setup()
    let receivedBody: unknown
    const onSuccess = vi.fn()

    server.use(
      http.post('/api/payments', async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json(paymentFixtures.detail, { status: 201 })
      }),
    )

    renderRegisterPaymentDialog({ onSuccess })

    await selectPaymentMethod('Transferencia')
    await user.type(screen.getByLabelText('Referencia (opcional)'), '  TR-999  ')
    await user.click(screen.getByLabelText('1. abril de 2026'))
    await user.click(getButton('Revisar pago'))
    await waitFor(() => {
      expect(getButton('Confirmar pago')).toBeEnabled()
    })
    await user.click(getButton('Confirmar pago'))

    expect(await screen.findByText('Pago registrado correctamente')).toBeInTheDocument()
    expect(onSuccess).toHaveBeenCalledWith(paymentFixtures.detail)
    expect(receivedBody).toEqual({
      customerId: 1,
      paymentMethod: 'TRANSFER',
      reference: 'TR-999',
      allocations: [
        {
          saleLotId: 901,
          installments: [{ installmentId: 3001, amount: 16666.67 }],
        },
      ],
    })
  })

  it('resets and closes through the close action', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderRegisterPaymentDialog({ onClose })

    await user.click(getButton('Cerrar'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('opens the receipt from the success state', async () => {
    const user = userEvent.setup()
    const onOpenReceipt = vi.fn()
    server.use(http.post('/api/payments', () => HttpResponse.json(paymentFixtures.detail, { status: 201 })))
    renderRegisterPaymentDialog({ onOpenReceipt })

    await user.click(screen.getByLabelText('1. abril de 2026'))
    await user.click(getButton('Revisar pago'))
    await waitFor(() => {
      expect(getButton('Confirmar pago')).toBeEnabled()
    })
    await user.click(getButton('Confirmar pago'))
    await screen.findByText('Imprimir recibo')
    await user.click(getButton('Imprimir recibo'))

    expect(onOpenReceipt).toHaveBeenCalledWith(701)
  })
})
