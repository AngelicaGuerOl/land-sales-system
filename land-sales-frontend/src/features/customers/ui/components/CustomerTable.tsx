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
import type { Customer } from '../../domain/entities/Customer'
import { CustomerStatusChip } from './CustomerStatusChip'

ModuleRegistry.registerModules([AllCommunityModule])

type Props = {
  customers: Customer[]
  loading?: boolean
  onSelect(customer: Customer): void
  onEdit(customer: Customer): void
  onStatus(customer: Customer, active: boolean): void
}

function CustomerActions({ customer, onSelect, onEdit, onStatus }: Omit<Props, 'customers' | 'loading'> & { customer: Customer }) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
      <Tooltip title="Ver detalle">
        <IconButton aria-label={`Ver detalle de ${customer.fullName}`} color="primary" onClick={() => onSelect(customer)} size="small" sx={{ bgcolor: 'primary.50' }}>
          <VisibilityRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Editar">
        <IconButton aria-label={`Editar a ${customer.fullName}`} color="primary" onClick={() => onEdit(customer)} size="small" sx={{ bgcolor: 'primary.50' }}>
          <EditRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {customer.active ? (
        <Tooltip title="Desactivar">
          <IconButton aria-label={`Desactivar a ${customer.fullName}`} color="error" onClick={() => onStatus(customer, false)} size="small" sx={{ bgcolor: 'error.50' }}>
            <BlockRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Activar">
          <IconButton aria-label={`Activar a ${customer.fullName}`} color="success" onClick={() => onStatus(customer, true)} size="small" sx={{ bgcolor: 'success.50' }}>
            <CheckCircleRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  )
}

export function CustomerTable({ customers, loading = false, onSelect, onEdit, onStatus }: Props) {
  const columnDefs = useMemo<ColDef<Customer>[]>(() => [
    { field: 'fullName', headerName: 'Nombre', flex: 1.2, minWidth: 190, cellRenderer: ({ value }: { value?: string }) => <Typography sx={{ fontSize: 'inherit', fontWeight: 700 }}>{value}</Typography> },
    { field: 'phone', headerName: 'Teléfono', flex: 0.85, minWidth: 130 },
    { field: 'alternatePhone', headerName: 'Teléfono alternativo', flex: 0.95, minWidth: 160, valueFormatter: ({ value }) => value || 'No registrado' },
    {
      field: 'address', headerName: 'Domicilio', flex: 1.5, minWidth: 210,
      cellRenderer: ({ value }: { value?: string | null }) => value ? <Tooltip title={value}><Typography noWrap sx={{ fontSize: 'inherit' }}>{value}</Typography></Tooltip> : <Typography color="text.secondary" sx={{ fontSize: 'inherit' }}>No registrado</Typography>,
    },
    { field: 'active', headerName: 'Estado', flex: 0.65, minWidth: 110, cellRenderer: ({ data }: { data?: Customer }) => data ? <CustomerStatusChip active={data.active} /> : null },
    { colId: 'actions', headerName: 'Acciones', flex: 0.95, minWidth: 190, sortable: false, filter: false, cellRenderer: ({ data }: { data?: Customer }) => data ? <CustomerActions customer={data} onSelect={onSelect} onEdit={onEdit} onStatus={onStatus} /> : null },
  ], [onEdit, onSelect, onStatus])

  return (
    <Box className="ag-theme-balham pos-data-grid" sx={{ width: '100%', '& .ag-header-cell-text': { fontSize: 14, fontWeight: 600 }, '& .ag-cell': { fontSize: 14 }, '& .ag-row-hover': { backgroundColor: 'action.hover !important' } }}>
      <AgGridReact<Customer> animateRows columnDefs={columnDefs} defaultColDef={{ filter: false, resizable: true, sortable: true }} domLayout="autoHeight" getRowId={({ data }) => data.id.toString()} theme="legacy" loading={loading} noRowsOverlayComponent={() => <Typography color="text.secondary" variant="body2">No hay clientes para mostrar.</Typography>} rowData={customers} rowHeight={52} />
    </Box>
  )
}
