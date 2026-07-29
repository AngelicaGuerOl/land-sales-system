import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { reportFixtures, reportHandlers } from '../../../../test/handlers'
import { renderWithProviders } from '../../../../test/render'
import { server } from '../../../../test/server'
import { ReportPage } from './ReportPage'

function renderReportPage() {
  return renderWithProviders(<ReportPage />)
}

function setDate(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

function currentMonthRange() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return {
    from: `${year}-${month}-01`,
    to: `${year}-${month}-${day}`,
  }
}

describe('ReportPage', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the loading state while the report is being fetched', () => {
    server.use(
      http.get('/api/reports/summary', async () => {
        await delay(100)
        return HttpResponse.json(reportFixtures.summary)
      }),
    )

    renderReportPage()

    expect(screen.getByText('Consultando reporte...')).toBeInTheDocument()
  })

  it('shows the report summary returned by the API', async () => {
    server.use(reportHandlers.getSummarySuccess())

    renderReportPage()

    expect(screen.getByText('Reporte general')).toBeInTheDocument()
    expect(await screen.findByText('$780,000.00')).toBeInTheDocument()
    expect(screen.getByText(/Periodo consultado:/)).toBeInTheDocument()
    expect(screen.getByText('Ventas')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getAllByText('Lotes vendidos').length).toBeGreaterThan(1)
    expect(screen.getByText('$225,000.00')).toBeInTheDocument()
    expect(screen.getByText('$555,000.00')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('shows the empty state when the period has no movements', async () => {
    server.use(reportHandlers.getSummaryEmpty())

    renderReportPage()

    expect(await screen.findByText('Sin movimientos')).toBeInTheDocument()
    expect(screen.getByText('No se encontraron ventas ni pagos en el periodo seleccionado.')).toBeInTheDocument()
    expect(screen.getByText('Sin ventas por manzana en el periodo.')).toBeInTheDocument()
  })

  it('shows an error when the API fails', async () => {
    server.use(reportHandlers.getSummaryError())

    renderReportPage()

    expect(await screen.findByText('No fue posible consultar el reporte.')).toBeInTheDocument()
  })

  it('validates that the start date is not after the end date', async () => {
    const user = userEvent.setup()
    server.use(reportHandlers.getSummarySuccess())

    renderReportPage()
    await screen.findByText('$780,000.00')

    setDate('Desde', '2026-08-01')
    setDate('Hasta', '2026-07-01')
    await user.click(screen.getByRole('button', { name: 'Consultar' }))

    expect(screen.getByText('La fecha inicial no puede ser posterior a la fecha final.')).toBeInTheDocument()
  })

  it('sends the selected date range to the API when consulting', async () => {
    const user = userEvent.setup()
    const receivedQueries: string[] = []

    server.use(
      http.get('/api/reports/summary', ({ request }) => {
        receivedQueries.push(new URL(request.url).search)
        return HttpResponse.json(reportFixtures.summary)
      }),
    )

    renderReportPage()
    await screen.findByText('$780,000.00')

    setDate('Desde', '2026-06-01')
    setDate('Hasta', '2026-06-30')
    await user.click(screen.getByRole('button', { name: 'Consultar' }))

    await waitFor(() => {
      expect(receivedQueries.some((query) => query.includes('dateFrom=2026-06-01'))).toBe(true)
      expect(receivedQueries.some((query) => query.includes('dateTo=2026-06-30'))).toBe(true)
    })
  })

  it('clears the date range back to the current month and consults again', async () => {
    const user = userEvent.setup()
    const range = currentMonthRange()
    const receivedQueries: string[] = []

    server.use(
      http.get('/api/reports/summary', ({ request }) => {
        receivedQueries.push(new URL(request.url).search)
        return HttpResponse.json(reportFixtures.summary)
      }),
    )

    renderReportPage()
    await screen.findByText('$780,000.00')

    setDate('Desde', '2026-06-01')
    setDate('Hasta', '2026-06-30')
    await user.click(screen.getByRole('button', { name: 'Limpiar' }))

    expect(screen.getByLabelText('Desde')).toHaveValue(range.from)
    expect(screen.getByLabelText('Hasta')).toHaveValue(range.to)
    await waitFor(() => {
      expect(receivedQueries.some((query) => query.includes(`dateFrom=${range.from}`))).toBe(true)
      expect(receivedQueries.some((query) => query.includes(`dateTo=${range.to}`))).toBe(true)
    })
  })

  it('prints the report when the user clicks print', async () => {
    const user = userEvent.setup()
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined)
    server.use(reportHandlers.getSummarySuccess())

    renderReportPage()
    await screen.findByText('$780,000.00')

    await user.click(screen.getByRole('button', { name: 'Imprimir' }))

    expect(print).toHaveBeenCalledTimes(1)
  })
})
