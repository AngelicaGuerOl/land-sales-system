import PrintRoundedIcon from '@mui/icons-material/PrintRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Alert, Box, Button, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { EmptyState } from '../../../../shared/ui/components/EmptyState'
import { LoadingScreen } from '../../../../shared/ui/components/LoadingScreen'
import { PageContainer } from '../../../../shared/ui/layout/PageContainer'
import { formatCurrency } from '../../../../shared/utils/formatters'
import { useReportSummary } from '../hooks/useReportSummary'

function localDate(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function monthRange() {
  const today = new Date()
  return { from: localDate(new Date(today.getFullYear(), today.getMonth(), 1)), to: localDate(today) }
}

const dateLabel = (value: string) => new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))

export function ReportPage() {
  const [initial] = useState(() => monthRange())
  const [dateFrom, setDateFrom] = useState(initial.from)
  const [dateTo, setDateTo] = useState(initial.to)
  const [applied, setApplied] = useState(initial)
  const [validationError, setValidationError] = useState<string | null>(null)
  const query = useReportSummary(applied.from, applied.to, validationError === null)
  const report = query.data
  const hasMovements = Boolean(report && (report.salesCount > 0 || report.laterPaymentsAmount > 0))

  function consult() {
    if (!dateFrom || !dateTo || dateFrom > dateTo) {
      setValidationError('La fecha inicial no puede ser posterior a la fecha final.')
      return
    }
    setValidationError(null)
    setApplied({ from: dateFrom, to: dateTo })
  }

  function clear() {
    const next = monthRange()
    setDateFrom(next.from)
    setDateTo(next.to)
    setValidationError(null)
    setApplied(next)
  }

  return <PageContainer><Box className="report-container"><Stack spacing={2.25}>
    <Box className="no-print" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
      <Box><Typography variant="h4" sx={{ fontWeight: 700 }}>Reporte general</Typography><Typography color="text.secondary">Consulta el resumen de ventas y pagos de un periodo.</Typography></Box>
      <Button variant="outlined" startIcon={<PrintRoundedIcon />} onClick={() => window.print()}>Imprimir</Button>
    </Box>
    <Paper className="no-print" variant="outlined" sx={{ p: 1.5 }}><Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} sx={{ alignItems: { md: 'center' } }}>
      <TextField type="date" label="Desde" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
      <TextField type="date" label="Hasta" value={dateTo} onChange={(event) => setDateTo(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
      <Button variant="contained" startIcon={<SearchRoundedIcon />} onClick={consult}>Consultar</Button>
      <Button color="inherit" onClick={clear}>Limpiar</Button>
    </Stack></Paper>
    {validationError ? <Alert className="no-print" severity="error">{validationError}</Alert> : null}
    {query.isLoading ? <LoadingScreen message="Consultando reporte..." /> : null}
    {query.isError ? <Alert className="no-print" severity="error">No fue posible consultar el reporte.</Alert> : null}
    {report ? <>
      <Box className="report-period"><Typography variant="body2" color="text.secondary">Periodo consultado: {dateLabel(report.dateFrom)} al {dateLabel(report.dateTo)}</Typography><Typography className="print-only" variant="body2">Fecha de impresión: {new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())}</Typography></Box>
      {!hasMovements ? <EmptyState title="Sin movimientos" description="No se encontraron ventas ni pagos en el periodo seleccionado." /> : null}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 1.25 }}>
        {([['Ventas', String(report.salesCount)], ['Lotes vendidos', String(report.soldLotsCount)], ['Total vendido', formatCurrency(report.totalAgreedAmount)], ['Enganches', formatCurrency(report.totalDownPayment)], ['Pagos posteriores', formatCurrency(report.laterPaymentsAmount)], ['Total recibido', formatCurrency(report.totalCollectedAmount)], ['Total financiado', formatCurrency(report.totalFinancedAmount)], ['Saldo pendiente', formatCurrency(report.outstandingBalance)]] as const).map(([label, value]) => <Paper key={label} variant="outlined" sx={{ p: 1.75 }}><Typography variant="body2" color="text.secondary">{label}</Typography><Typography variant="h6" sx={{ fontWeight: 800, mt: 0.25 }}>{value}</Typography></Paper>)}
      </Box>
      <Paper variant="outlined" sx={{ overflowX: 'auto' }}><Table sx={{ minWidth: 520 }}><TableHead><TableRow><TableCell sx={{ fontWeight: 700 }}>Manzana</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>Lotes vendidos</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>Total vendido</TableCell></TableRow></TableHead><TableBody>{report.byBlock.map((block) => <TableRow key={block.blockCode}><TableCell>{block.blockCode}</TableCell><TableCell align="right">{block.soldLotsCount}</TableCell><TableCell align="right">{formatCurrency(block.totalAgreedAmount)}</TableCell></TableRow>)}{report.byBlock.length === 0 ? <TableRow><TableCell colSpan={3}><Typography color="text.secondary">Sin ventas por manzana en el periodo.</Typography></TableCell></TableRow> : null}</TableBody></Table></Paper>
    </> : null}
  </Stack></Box><style>{`\n    .print-only { display: none; }\n    @media print {\n      @page { size: letter; margin: 12mm; }\n      body { background: white !important; }\n      .no-print, nav, header, aside, .MuiDrawer-root, .MuiAppBar-root { display: none !important; }\n      .print-only { display: block; }\n      .report-container { padding: 0 !important; }\n      .report-container .MuiPaper-root { box-shadow: none !important; }\n    }\n  `}</style></PageContainer>
}
