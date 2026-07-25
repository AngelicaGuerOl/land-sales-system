import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '../../../../shared/ui/components/EmptyState'
import { LoadingScreen } from '../../../../shared/ui/components/LoadingScreen'
import { PageContainer } from '../../../../shared/ui/layout/PageContainer'
import { formatCurrency, formatNumber } from '../../../../shared/utils/formatters'
import type { SaleLotDetail, SaleStatus } from '../../domain/entities/Sale'
import { useSale } from '../hooks/useSale'

const saleStatusLabel: Record<SaleStatus, string> = { ACTIVE: 'Pendiente', PAID: 'Liquidada', CANCELLED: 'Cancelada' }
const saleStatusColor: Record<SaleStatus, 'success' | 'warning' | 'default'> = { ACTIVE: 'warning', PAID: 'success', CANCELLED: 'default' }
const installmentStatus = { PENDING: 'Pendiente', PARTIAL: 'Parcialmente pagada', PAID: 'Pagada' } as const
const monthLabel = (value: string) => new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(new Date(`${value.slice(0, 7)}-01T00:00:00`))
const dateLabel = (value: string) => new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date(`${value}T00:00:00`))
const dateTimeLabel = (value: string) => { const [date, time = '00:00:00'] = value.split('T'); return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(`${date}T${time}`)) }

function LotSummary({ lot }: { lot: SaleLotDetail }) {
  return <Typography sx={{ fontWeight: 700 }}>{lot.code} · {lot.status === 'PAID' ? 'Liquidada' : lot.status === 'CANCELLED' ? 'Cancelada' : 'En pagos'} · Saldo pendiente {formatCurrency(lot.outstandingBalance)}</Typography>
}

function LotMetrics({ lot }: { lot: SaleLotDetail }) {
  const hasMeasurements = typeof lot.frontMeters === 'number' && Number.isFinite(lot.frontMeters) && typeof lot.depthMeters === 'number' && Number.isFinite(lot.depthMeters)
  const measurements = hasMeasurements ? `${formatNumber(lot.frontMeters, ' m')} × ${formatNumber(lot.depthMeters, ' m')}` : null
  return <Stack spacing={1.5}><Typography>Manzana: {lot.blockCode} · Número: {lot.lotNumber} · Superficie: {formatNumber(lot.areaM2, ' m²')}{measurements ? ` · Medidas: ${measurements}` : ''}</Typography><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><Typography>Precio acordado: {formatCurrency(lot.agreedPrice)}</Typography><Typography>Enganche: {formatCurrency(lot.downPayment)}</Typography><Typography>Saldo financiado: {formatCurrency(lot.financedAmount)}</Typography><Typography>Saldo pendiente: {formatCurrency(lot.outstandingBalance)}</Typography></Stack>{lot.installments.length > 0 ? <></> : null}</Stack>
}

export function SaleDetailPage() {
  const navigate = useNavigate(); const id = Number(useParams<{ id: string }>().id); const query = useSale(Number.isFinite(id) ? id : null)
  if (query.isLoading) return <PageContainer><LoadingScreen message="Cargando detalle de venta..." /></PageContainer>
  if (query.isError || !query.data) return <PageContainer><Alert severity="error">No fue posible cargar la venta.</Alert></PageContainer>
  const sale = query.data
  return <PageContainer><Stack spacing={2}><Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/ventas')} sx={{ alignSelf: 'flex-start' }}>Volver al historial</Button><Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}><Box><Typography variant="h4" sx={{ fontWeight: 700 }}>{sale.folio}</Typography><Typography color="text.secondary">Venta del {dateLabel(sale.saleDate)}</Typography></Box><Chip label={saleStatusLabel[sale.status]} color={saleStatusColor[sale.status]} /></Stack><Paper sx={{ p: 2.5 }}><Stack spacing={2}><Typography variant="h6">Cliente</Typography><Typography><strong>{sale.customer.fullName}</strong></Typography><Typography color="text.secondary">{sale.customer.phone}</Typography><Typography variant="h6" sx={{ pt: 1 }}>Registro</Typography><Typography>Fecha de registro: {dateTimeLabel(sale.createdAt)}</Typography><Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5, pt: 1 }}>{[['Total acordado', sale.totalAgreedPrice], ['Enganche total', sale.totalDownPayment], ['Saldo financiado', sale.totalFinancedAmount]].map(([label, value]) => <Paper key={String(label)} variant="outlined" sx={{ p: 1.5 }}><Typography variant="body2" color="text.secondary">{label}</Typography><Typography sx={{ fontWeight: 700 }}>{formatCurrency(Number(value))}</Typography></Paper>)}<Paper variant="outlined" sx={{ p: 1.5 }}><Typography variant="body2" color="text.secondary">Lotes</Typography><Typography sx={{ fontWeight: 700 }}>{sale.lots.length}</Typography></Paper></Box></Stack></Paper>{sale.lots.map((lot, index) => <Accordion key={lot.lotId} defaultExpanded={index === 0}><AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}><LotSummary lot={lot} /></AccordionSummary><AccordionDetails><Stack spacing={1.5}><LotMetrics lot={lot} />{lot.installments.length === 0 ? <EmptyState title="Pago total" description="Este lote no genera mensualidades." /> : <Table size="small" sx={{ minWidth: 620 }}><TableHead><TableRow>{['Núm.', 'Mes', 'Importe', 'Pagado', 'Pendiente', 'Estado'].map((header, index) => <TableCell key={header} align={index >= 2 && index <= 4 ? 'right' : 'left'} sx={{ fontWeight: 700 }}>{header}</TableCell>)}</TableRow></TableHead><TableBody>{lot.installments.map((installment) => <TableRow key={installment.installmentNumber}><TableCell>{installment.installmentNumber}</TableCell><TableCell>{monthLabel(installment.paymentMonth)}</TableCell><TableCell align="right">{formatCurrency(installment.amount)}</TableCell><TableCell align="right">{formatCurrency(installment.paidAmount)}</TableCell><TableCell align="right">{formatCurrency(installment.amount - installment.paidAmount)}</TableCell><TableCell><Chip label={installmentStatus[installment.status]} size="small" variant="outlined" /></TableCell></TableRow>)}</TableBody></Table>}</Stack></AccordionDetails></Accordion>)}</Stack></PageContainer>
}
