import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { lotFixtures } from '../../../../test/handlers'
import { renderWithProviders } from '../../../../test/render'
import type { Lot, LotBlockOption } from '../../domain/entities/Lot'
import { LotMapper } from '../../infrastructure/mappers/LotMapper'
import { LotFormDialog } from './LotFormDialog'

const blocks: LotBlockOption[] = lotFixtures.blocks.map(LotMapper.toBlock)
const availableLot: Lot = LotMapper.toLot(lotFixtures.available)
const soldLot: Lot = LotMapper.toLot(lotFixtures.sold)

function renderLotFormDialog({
  mode = 'create',
  lot = null,
  pending = false,
  onClose = vi.fn(),
  onSubmit = vi.fn(),
}: {
  mode?: 'create' | 'edit'
  lot?: Lot | null
  pending?: boolean
  onClose?: () => void
  onSubmit?: Parameters<typeof LotFormDialog>[0]['onSubmit']
} = {}) {
  const result = renderWithProviders(
    <LotFormDialog
      open
      mode={mode}
      lot={lot}
      blocks={blocks}
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

function setField(label: string | RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

async function selectBlock(user: ReturnType<typeof userEvent.setup>, blockCode = 'A') {
  fireEvent.mouseDown(screen.getByLabelText('Manzana'))
  await user.click(screen.getByText(blockCode))
}

async function fillRequiredLotFields(user: ReturnType<typeof userEvent.setup>) {
  await selectBlock(user)
  await user.type(screen.getByLabelText('Número'), '07')
}

describe('LotFormDialog', () => {
  it('renders the main fields and actions for lot creation', () => {
    renderLotFormDialog()

    expect(screen.getByText('Registrar lote')).toBeInTheDocument()
    expect(screen.getByLabelText('Manzana')).toBeInTheDocument()
    expect(screen.getByLabelText('Número')).toBeInTheDocument()
    expect(screen.getByLabelText('Código')).toBeInTheDocument()
    expect(screen.getByLabelText('Superficie (m²)')).toBeInTheDocument()
    expect(screen.getByLabelText('Frente (m)')).toBeInTheDocument()
    expect(screen.getByLabelText('Fondo (m)')).toBeInTheDocument()
    expect(screen.getByLabelText('Precio')).toBeInTheDocument()
    expect(screen.getByLabelText('Referencia de ubicación')).toBeInTheDocument()
    expect(screen.getByLabelText('Observaciones')).toBeInTheDocument()
    expect(getButton('Cancelar')).toBeInTheDocument()
    expect(getButton('Guardar')).toBeEnabled()
  })

  it('shows validation messages when required fields are submitted empty', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderLotFormDialog({ onSubmit })

    await user.click(getButton('Guardar'))

    expect(await screen.findByText('Selecciona una manzana')).toBeInTheDocument()
    expect(screen.getByText('Ingresa el número del lote')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the real payload when creating a lot', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderLotFormDialog({ onSubmit })

    await selectBlock(user)
    setField('Número', '07')
    setField('Código', '  A-07  ')
    setField('Superficie (m²)', '120.5')
    setField('Frente (m)', '8')
    setField('Fondo (m)', '15')
    setField('Precio', '250000')
    setField('Referencia de ubicación', '  Cerca de acceso principal  ')
    setField('Observaciones', '  Sin observaciones reales  ')
    await user.click(getButton('Guardar'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        blockId: 10,
        lotNumber: '07',
        code: 'A-07',
        areaM2: 120.5,
        frontMeters: 8,
        depthMeters: 15,
        currentPrice: 250000,
        locationReference: 'Cerca de acceso principal',
        notes: 'Sin observaciones reales',
      })
    })
  })

  it('loads existing lot data when editing', () => {
    renderLotFormDialog({ mode: 'edit', lot: availableLot })

    expect(screen.getByText('Editar A-01')).toBeInTheDocument()
    expect(screen.getByLabelText('Manzana')).toHaveTextContent('A')
    expect(screen.getByLabelText('Número')).toHaveValue('01')
    expect(screen.getByLabelText('Código')).toHaveValue('A-01')
    expect(screen.getByLabelText('Superficie (m²)')).toHaveValue('120')
    expect(screen.getByLabelText('Frente (m)')).toHaveValue('8')
    expect(screen.getByLabelText('Fondo (m)')).toHaveValue('15')
    expect(screen.getByLabelText('Precio')).toHaveValue('250000')
    expect(screen.getByLabelText('Referencia de ubicación')).toHaveValue('Frente al parque')
    expect(screen.getByLabelText('Observaciones')).toHaveValue('Lote ficticio disponible')
  })

  it('submits the edit payload with version when price is unchanged', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderLotFormDialog({ mode: 'edit', lot: availableLot, onSubmit })

    setField('Observaciones', '  Nota actualizada  ')
    await user.click(getButton('Guardar'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        blockId: 10,
        lotNumber: '01',
        code: 'A-01',
        areaM2: 120,
        frontMeters: 8,
        depthMeters: 15,
        currentPrice: 250000,
        locationReference: 'Frente al parque',
        notes: 'Nota actualizada',
        version: 3,
      })
    })
  })

  it('requires a reason when the price changes during editing', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderLotFormDialog({ mode: 'edit', lot: availableLot, onSubmit })

    setField('Precio', '275000')
    expect(await screen.findByLabelText(/Motivo del cambio de precio/i)).toBeInTheDocument()

    await user.click(getButton('Guardar'))

    expect(await screen.findByText('Ingresa el motivo del cambio de precio')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()

    setField(/Motivo del cambio de precio/i, 'Ajuste comercial')
    await user.click(getButton('Guardar'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          currentPrice: 275000,
          priceChangeReason: 'Ajuste comercial',
          version: 3,
        }),
      )
    })
  })

  it('shows numeric validation when a decimal field is negative', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderLotFormDialog({ onSubmit })

    await fillRequiredLotFields(user)
    await user.type(screen.getByLabelText('Superficie (m²)'), '-1')
    await user.click(getButton('Guardar'))

    expect(await screen.findByText('No puede ser negativo')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('disables fields and actions while saving', () => {
    renderLotFormDialog({ lot: availableLot, mode: 'edit', pending: true })

    expect(screen.getByLabelText('Manzana')).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByLabelText('Número')).toBeDisabled()
    expect(screen.getByLabelText('Superficie (m²)')).toBeDisabled()
    expect(screen.getByLabelText('Precio')).toBeDisabled()
    expect(screen.getByLabelText('Referencia de ubicación')).toBeDisabled()
    expect(screen.getByLabelText('Observaciones')).toBeDisabled()
    expect(getButton('Cancelar')).toBeDisabled()
    expect(getButton('Guardando...')).toBeDisabled()
  })

  it('only allows reference and notes to remain editable for sold lots', () => {
    renderLotFormDialog({ lot: soldLot, mode: 'edit' })

    expect(screen.getByLabelText('Manzana')).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByLabelText('Número')).toBeDisabled()
    expect(screen.getByLabelText('Superficie (m²)')).toBeDisabled()
    expect(screen.getByLabelText('Frente (m)')).toBeDisabled()
    expect(screen.getByLabelText('Fondo (m)')).toBeDisabled()
    expect(screen.getByLabelText('Precio')).toBeDisabled()
    expect(screen.getByLabelText('Código')).toBeEnabled()
    expect(screen.getByLabelText('Referencia de ubicación')).toBeEnabled()
    expect(screen.getByLabelText('Observaciones')).toBeEnabled()
    expect(screen.getByText('Los lotes vendidos solo permiten editar referencia y observaciones.')).toBeInTheDocument()
  })

  it('calls onClose when cancelling', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderLotFormDialog({ onClose })

    await user.click(getButton('Cancelar'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
