import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Alert, Button, FormControl, InputLabel, MenuItem, Select, Snackbar, Stack, TablePagination, TextField, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { ApiError } from '../../../../shared/api/apiError'
import { ConfirmDialog } from '../../../../shared/ui/components/ConfirmDialog'
import { EmptyState } from '../../../../shared/ui/components/EmptyState'
import { LoadingScreen } from '../../../../shared/ui/components/LoadingScreen'
import { PageContainer } from '../../../../shared/ui/layout/PageContainer'
import type { Customer, CustomerFormInput } from '../../domain/entities/Customer'
import { CustomerDetailsDialog } from '../components/CustomerDetailsDialog'
import { CustomerFormDialog } from '../components/CustomerFormDialog'
import { CustomerTable } from '../components/CustomerTable'
import { useCustomerMutations } from '../hooks/useCustomerMutations'
import { useCustomers } from '../hooks/useCustomers'

type ActiveFilter = 'all' | 'active' | 'inactive'
type Feedback = { message: string; severity: 'success' | 'error' }
type FormState = Customer | null | undefined
type StatusState = { customer: Customer; active: boolean } | null

function errorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return 'No fue posible completar la operación.'
  const details = error.details as { validationErrors?: Record<string, string>; message?: string } | undefined
  const validation = details?.validationErrors ? Object.values(details.validationErrors)[0] : undefined
  if (validation) return validation
  if (error.status === 400) return details?.message ?? 'Revisa los datos capturados.'
  if (error.status === 404) return 'El cliente ya no existe.'
  if (error.status === 409) return details?.message ?? 'El cliente entra en conflicto con otro registro.'
  return 'No fue posible completar la operación.'
}

export function CustomersPage() {
  const queryClient = useQueryClient()
  const mutations = useCustomerMutations()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(25)
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  const [formCustomer, setFormCustomer] = useState<FormState>(undefined)
  const [statusState, setStatusState] = useState<StatusState>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(0)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const query = useMemo(() => ({
    page,
    size,
    ...(search ? { search } : {}),
    ...(activeFilter === 'all' ? {} : { active: activeFilter === 'active' }),
  }), [activeFilter, page, search, size])
  const customersQuery = useCustomers(query)
  const customers = customersQuery.data?.content ?? []
  const pending = mutations.create.isPending || mutations.update.isPending || mutations.changeStatus.isPending

  function refresh(customerId?: number) {
    void queryClient.invalidateQueries({ queryKey: ['customers'] })
    if (customerId !== undefined) void queryClient.invalidateQueries({ queryKey: ['customer', customerId] })
  }

  function saveCustomer(input: CustomerFormInput) {
    const onSuccess = (saved: Customer) => {
      refresh(saved.id)
      setFormCustomer(undefined)
      setFeedback({ message: 'Cliente guardado correctamente.', severity: 'success' })
    }
    const onError = (error: unknown) => setFeedback({ message: errorMessage(error), severity: 'error' })
    if (formCustomer) mutations.update.mutate({ id: formCustomer.id, input }, { onSuccess, onError })
    else mutations.create.mutate(input, { onSuccess, onError })
  }

  function confirmStatusChange() {
    if (!statusState) return
    mutations.changeStatus.mutate({ id: statusState.customer.id, active: statusState.active }, {
      onSuccess: (saved) => {
        refresh(saved.id)
        setStatusState(null)
        setFeedback({ message: statusState.active ? 'Cliente activado correctamente.' : 'Cliente desactivado correctamente.', severity: 'success' })
      },
      onError: (error) => setFeedback({ message: errorMessage(error), severity: 'error' }),
    })
  }

  return (
    <PageContainer>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 2 }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
          <Stack spacing={0.25}>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2rem' }, lineHeight: 1.15 }}>Clientes</Typography>
            <Typography color="text.secondary">Administra las personas que pueden adquirir uno o varios lotes.</Typography>
          </Stack>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setFormCustomer(null)} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>Registrar cliente</Button>
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Buscar por nombre o teléfono" aria-label="Buscar por nombre o teléfono" slotProps={{ input: { startAdornment: <SearchRoundedIcon color="action" sx={{ mr: 1 }} /> } }} sx={{ flex: 1 }} />
          <FormControl sx={{ minWidth: { xs: '100%', md: 170 } }}>
            <InputLabel id="customer-status-label">Estado</InputLabel>
            <Select labelId="customer-status-label" label="Estado" value={activeFilter} onChange={(event) => { setActiveFilter(event.target.value as ActiveFilter); setPage(0) }}>
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="active">Activos</MenuItem>
              <MenuItem value="inactive">Inactivos</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', gap: 1, alignItems: { sm: 'center' } }}>
          <Typography variant="h6">Clientes registrados</Typography>
          <Typography color="text.secondary">{customersQuery.isLoading ? 'Actualizando...' : `${customersQuery.data?.totalElements ?? 0} resultado(s)`}</Typography>
        </Stack>
        {customersQuery.isLoading ? <LoadingScreen message="Cargando clientes..." /> : null}
        {customersQuery.isError ? <Alert severity="error">No fue posible cargar los clientes.</Alert> : null}
        {!customersQuery.isLoading && !customersQuery.isError && customers.length === 0 ? <EmptyState title="Sin resultados" description="Ajusta la búsqueda o el estado seleccionado." /> : null}
        {!customersQuery.isLoading && !customersQuery.isError && customers.length > 0 ? <CustomerTable customers={customers} onSelect={(customer) => setSelectedCustomerId(customer.id)} onEdit={(customer) => setFormCustomer(customer)} onStatus={(customer, active) => setStatusState({ customer, active })} /> : null}
        <TablePagination component="div" count={customersQuery.data?.totalElements ?? 0} page={page} rowsPerPage={size} onPageChange={(_, nextPage) => setPage(nextPage)} onRowsPerPageChange={(event) => { setSize(Number(event.target.value)); setPage(0) }} rowsPerPageOptions={[10, 25, 50]} labelRowsPerPage="Filas por página" labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`} />
      </Stack>
      <CustomerDetailsDialog customerId={selectedCustomerId} onClose={() => setSelectedCustomerId(null)} onEdit={(customer) => { setSelectedCustomerId(null); setFormCustomer(customer) }} />
      <CustomerFormDialog open={formCustomer !== undefined} customer={formCustomer ?? null} pending={pending} onClose={() => setFormCustomer(undefined)} onSubmit={saveCustomer} />
      <ConfirmDialog open={statusState !== null} title={statusState?.active ? 'Activar cliente' : 'Desactivar cliente'} description={statusState?.active ? 'El cliente volverá a estar disponible para nuevas operaciones.' : 'El cliente dejará de aparecer entre los clientes activos, pero su información se conservará.'} confirmLabel={statusState?.active ? 'Activar' : 'Desactivar'} pending={mutations.changeStatus.isPending} onClose={() => setStatusState(null)} onConfirm={confirmStatusChange} />
      <Snackbar open={feedback !== null} autoHideDuration={5000} onClose={() => setFeedback(null)}><Alert severity={feedback?.severity ?? 'success'} onClose={() => setFeedback(null)} sx={{ width: '100%' }}>{feedback?.message}</Alert></Snackbar>
    </PageContainer>
  )
}
