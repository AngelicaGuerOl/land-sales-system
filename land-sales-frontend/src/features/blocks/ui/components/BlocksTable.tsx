import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { AllCommunityModule, ModuleRegistry, type ColDef } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { useMemo } from 'react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-balham.css'
import { formatNumber } from '../../../../shared/utils/formatters'
import type { LandBlock } from '../../domain/entities/LandBlock'

ModuleRegistry.registerModules([AllCommunityModule])

type Props = { blocks: LandBlock[]; loading?: boolean; onViewLots(block: LandBlock): void; onEdit(block: LandBlock): void; onDelete(block: LandBlock): void; onGenerate(block: LandBlock): void }

export function BlocksTable({ blocks, loading = false, onViewLots, onEdit, onDelete, onGenerate }: Props) {
  const columnDefs = useMemo<ColDef<LandBlock>[]>(() => [
    { field: 'code', flex: 1, headerName: 'Código', minWidth: 140, cellRenderer: ({ value }: { value?: string }) => <Typography sx={{ fontSize: 'inherit', fontWeight: 700 }}>{value}</Typography> },
    { field: 'areaM2', flex: 1, headerName: 'Superficie', minWidth: 140, valueFormatter: ({ value }) => value === null ? 'No disponible' : formatNumber(Number(value), ' m²') },
    { field: 'registeredLotCount', flex: 1, headerName: 'Lotes registrados', minWidth: 155 },
    {
      colId: 'actions', flex: 1.6, headerName: 'Acciones', minWidth: 180, sortable: false, filter: false,
      cellRenderer: ({ data }: { data?: LandBlock }) => data ? <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
        <Tooltip title="Ver lotes"><IconButton aria-label="Ver lotes" color="primary" onClick={() => onViewLots(data)} size="small" sx={{ bgcolor: 'primary.50' }}><VisibilityRoundedIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Generar lotes"><IconButton aria-label="Generar lotes" color="secondary" onClick={() => onGenerate(data)} size="small" sx={{ bgcolor: 'secondary.50' }}><AutoAwesomeRoundedIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Editar"><IconButton aria-label="Editar manzana" color="primary" onClick={() => onEdit(data)} size="small" sx={{ bgcolor: 'primary.50' }}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
        {data.registeredLotCount === 0 ? <Tooltip title="Eliminar"><IconButton aria-label="Eliminar manzana" color="error" onClick={() => onDelete(data)} size="small" sx={{ bgcolor: 'error.50' }}><DeleteRoundedIcon fontSize="small" /></IconButton></Tooltip> : null}
      </Stack> : null,
    },
  ], [onDelete, onEdit, onGenerate, onViewLots])

  return <Box className="ag-theme-balham pos-data-grid" sx={{ height: 430, width: '100%', '& .ag-header-cell-text': { fontSize: 15, fontWeight: 700 }, '& .ag-cell': { fontSize: 15 }, '& .ag-row-hover': { backgroundColor: 'action.hover !important' } }}><AgGridReact<LandBlock> animateRows columnDefs={columnDefs} defaultColDef={{ filter: false, resizable: true, sortable: true }} getRowId={({ data }) => data.id.toString()} theme="legacy" loading={loading} noRowsOverlayComponent={() => <Typography color="text.secondary" variant="body2">No hay manzanas para mostrar.</Typography>} rowData={blocks} /></Box>
}
