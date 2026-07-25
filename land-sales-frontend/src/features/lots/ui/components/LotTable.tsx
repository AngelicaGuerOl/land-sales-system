import BlockRoundedIcon from '@mui/icons-material/BlockRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { AllCommunityModule, ModuleRegistry, type ColDef } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { useMemo } from 'react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-balham.css'
import { formatCurrency, formatNumber } from '../../../../shared/utils/formatters'
import type { Lot } from '../../domain/entities/Lot'
import { LotStatusChip } from './LotStatusChip'

ModuleRegistry.registerModules([AllCommunityModule])

type LotTableProps = { lots: Lot[]; loading?: boolean; onSelect(lot: Lot): void; onEdit(lot: Lot): void; onStatus(lot: Lot, status: 'AVAILABLE' | 'BLOCKED'): void }

export function LotTable({ lots, loading = false, onSelect, onEdit, onStatus }: LotTableProps) {
  const columnDefs = useMemo<ColDef<Lot>[]>(() => [
    { field: 'code', flex: 1, headerName: 'Código', minWidth: 150, cellRenderer: ({ value }: { value?: string }) => <Typography sx={{ fontSize: 'inherit', fontWeight: 700 }}>{value}</Typography> },
    { field: 'blockCode', flex: 0.8, headerName: 'Manzana', minWidth: 110 },
    { field: 'lotNumber', flex: 0.7, headerName: 'Número', minWidth: 95 },
    { field: 'areaM2', flex: 0.9, headerName: 'Superficie', minWidth: 125, valueFormatter: ({ value }) => formatNumber(value, ' m²') },
    { colId: 'dimensions', flex: 1, headerName: 'Medidas', minWidth: 140, valueGetter: ({ data }) => data ? `${formatNumber(data.frontMeters, ' m')} × ${formatNumber(data.depthMeters, ' m')}` : '' },
    { field: 'price', flex: 0.9, headerName: 'Precio', minWidth: 125, valueFormatter: ({ value }) => formatCurrency(value) },
    { field: 'status', flex: 0.59, headerName: 'Estado', minWidth: 120, cellRenderer: ({ data }: { data?: Lot }) => data ? <LotStatusChip status={data.status} /> : null },
    {
      colId: 'actions', flex: 0.7, headerName: 'Acciones', minWidth: 170, sortable: false, filter: false,
      cellRenderer: ({ data }: { data?: Lot }) => data ? <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
        <Tooltip title="Ver detalle"><IconButton aria-label="Ver detalle del lote" color="primary" onClick={() => onSelect(data)} size="small" sx={{ bgcolor: 'primary.50' }}><VisibilityRoundedIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Editar"><IconButton aria-label="Editar lote" color="primary" onClick={() => onEdit(data)} size="small" sx={{ bgcolor: 'primary.50' }}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
        {data.status === 'AVAILABLE' ? <Tooltip title="Bloquear"><IconButton aria-label="Bloquear lote" color="error" onClick={() => onStatus(data, 'BLOCKED')} size="small" sx={{ bgcolor: 'error.50' }}><BlockRoundedIcon fontSize="small" /></IconButton></Tooltip> : null}
        {data.status === 'BLOCKED' ? <Tooltip title="Desbloquear"><IconButton aria-label="Desbloquear lote" color="success" onClick={() => onStatus(data, 'AVAILABLE')} size="small" sx={{ bgcolor: 'success.50' }}><CheckCircleRoundedIcon fontSize="small" /></IconButton></Tooltip> : null}
      </Stack> : null,
    },
  ], [onEdit, onSelect, onStatus])

  return <Box className="ag-theme-balham pos-data-grid" sx={{ height: 430, width: '100%', '& .ag-header-cell-text': { fontSize: 15, fontWeight: 700 }, '& .ag-cell': { fontSize: 15 }, '& .ag-row-hover': { backgroundColor: 'action.hover !important' } }}><AgGridReact<Lot> animateRows columnDefs={columnDefs} defaultColDef={{ filter: false, resizable: true, sortable: true }} getRowId={({ data }) => data.id.toString()} theme="legacy" loading={loading} noRowsOverlayComponent={() => <Typography color="text.secondary" variant="body2">No hay lotes para mostrar.</Typography>} pagination paginationPageSize={25} paginationPageSizeSelector={[25, 50, 100]} rowData={lots} /></Box>
}
