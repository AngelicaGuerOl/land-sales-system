import AddIcon from '@mui/icons-material/Add'
import { Alert, Button, Snackbar, Stack, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ApiError } from '../../../../shared/api/apiError'
import { EmptyState } from '../../../../shared/ui/components/EmptyState'
import { LoadingScreen } from '../../../../shared/ui/components/LoadingScreen'
import { PageContainer } from '../../../../shared/ui/layout/PageContainer'
import type { Lot, LotFormInput, LotStatus } from '../../domain/entities/Lot'
import type { LotQuery } from '../../domain/repositories/LotRepository'
import { ConfirmDialog } from '../../../../shared/ui/components/ConfirmDialog'
import { LotDetailsPanel } from '../components/LotDetailsPanel'
import { LotFormDialog } from '../components/LotFormDialog'
import { LotsFilters, type LotsFiltersValue } from '../components/LotsFilters'
import { LotTable } from '../components/LotTable'
import { useBlocks } from '../hooks/useBlocks'
import { useLotMutations } from '../hooks/useLotMutations'
import { useLots } from '../hooks/useLots'

const initialFilters: LotsFiltersValue = { search: '', blockId: '', status: '' }

type Feedback = { message: string; severity: 'success' | 'error' }
type FormState = { mode: 'create' | 'edit'; lot: Lot | null } | null
type StatusState = { lot: Lot; status: 'AVAILABLE' | 'BLOCKED' } | null

function getErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return 'No fue posible completar la operación.'
  const details = error.details as { message?: string; validationErrors?: Record<string, string> } | undefined
  const validationMessage = details?.validationErrors ? Object.values(details.validationErrors)[0] : undefined
  if (validationMessage) return validationMessage
  if (error.status === 404) return 'El lote o la manzana ya no existe.'
  if (error.status === 409) return details?.message ?? 'El lote cambió o entra en conflicto con otro registro.'
  if (error.status === 400) return details?.message ?? 'Revisa los datos capturados.'
  return 'No fue posible completar la operación.'
}

export function LotsPage() {
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState<LotsFiltersValue>(() => ({
    ...initialFilters,
    blockId: searchParams.get('blockId') ? Number(searchParams.get('blockId')) : '',
  }))
  const [selectedLotId, setSelectedLotId] = useState<number | null>(null)
  const [formState, setFormState] = useState<FormState>(null)
  const [statusState, setStatusState] = useState<StatusState>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const queryClient = useQueryClient()
  const mutations = useLotMutations()
  const blocksQuery = useBlocks()
  const lotsQueryParams = useMemo<LotQuery | null>(() => {
    return {
      ...(filters.blockId === '' ? {} : { blockId: filters.blockId }),
      ...(filters.status === '' ? {} : { status: filters.status as LotStatus }),
      ...(filters.search.trim() ? { search: filters.search } : {}),
    }
  }, [filters.blockId, filters.search, filters.status])
  const lotsQuery = useLots(lotsQueryParams)

  const tableLots = lotsQuery.data ?? []
  const blocks = blocksQuery.data ?? []
  const pending = mutations.create.isPending || mutations.update.isPending || mutations.changeStatus.isPending

  async function refreshLots(lotId?: number) {
    await queryClient.invalidateQueries({ queryKey: ['lots'] })
    if (lotId !== undefined) {
      await queryClient.invalidateQueries({ queryKey: ['lot', lotId] })
      await queryClient.invalidateQueries({ queryKey: ['price-history', lotId] })
    }
  }

  function submitLot(input: LotFormInput) {
    const onSuccess = async (savedLot: Lot) => {
      await refreshLots(savedLot.id)
      setFormState(null)
      setFeedback({ message: 'Lote guardado correctamente.', severity: 'success' })
    }
    const onError = (error: unknown) => setFeedback({ message: getErrorMessage(error), severity: 'error' })
    if (formState?.mode === 'edit' && formState.lot) {
      mutations.update.mutate({ id: formState.lot.id, input }, { onSuccess, onError })
    } else {
      mutations.create.mutate(input, { onSuccess, onError })
    }
  }

  function confirmStatusChange() {
    if (!statusState) return
    mutations.changeStatus.mutate(
      { id: statusState.lot.id, status: statusState.status, version: statusState.lot.version },
      {
        onSuccess: async (savedLot) => {
          const message = statusState.status === 'BLOCKED' ? 'bloqueado' : 'desbloqueado'
          await refreshLots(savedLot.id)
          setStatusState(null)
          setFeedback({ message: `Lote ${message} correctamente.`, severity: 'success' })
        },
        onError: (error) => setFeedback({ message: getErrorMessage(error), severity: 'error' }),
      },
    )
  }

  return (
    <PageContainer>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 2 }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
          <Stack spacing={0.25}>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2rem' }, lineHeight: 1.15 }}>Lotes</Typography>
            <Typography color="text.secondary">Consulta y administra disponibilidad, medidas y precio.</Typography>
          </Stack>
          <Button variant="contained" size="medium" startIcon={<AddIcon />} onClick={() => setFormState({ mode: 'create', lot: null })} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>Registrar lote</Button>
        </Stack>
        <Stack spacing={1.5}>
          <LotsFilters
            blocks={blocks}
            value={filters}
            onChange={(next) => { setSelectedLotId(null); setFilters(next) }}
          />
          {blocksQuery.isError ? <Alert severity="error">No fue posible cargar las manzanas.</Alert> : null}
        </Stack>
        <Stack spacing={1}>
          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="h6">Lotes registrados</Typography>
            <Typography color="text.secondary">{lotsQuery.isLoading ? 'Actualizando...' : `${tableLots.length} resultado(s)`}</Typography>
          </Stack>
          {lotsQuery.isLoading ? <LoadingScreen message="Cargando lotes..." /> : null}
          {lotsQuery.isError ? <Alert severity="error">No fue posible cargar los lotes.</Alert> : null}
          {!lotsQuery.isLoading && !lotsQuery.isError && tableLots.length === 0 ? <EmptyState title="Sin resultados" description="Ajusta la búsqueda, manzana o estado seleccionado." /> : null}
          {!lotsQuery.isLoading && !lotsQuery.isError ? (
            <LotTable
              lots={tableLots}
              onSelect={(lot) => setSelectedLotId(lot.id)}
              onEdit={(lot) => { setSelectedLotId(null); setFormState({ mode: 'edit', lot }) }}
              onStatus={(lot, status) => setStatusState({ lot, status })}
            />
          ) : null}
        </Stack>
      </Stack>
      <LotDetailsPanel
        lotId={selectedLotId}
        onClose={() => setSelectedLotId(null)}
        onEdit={(lot) => { setSelectedLotId(null); setFormState({ mode: 'edit', lot }) }}
        onStatus={(lot, status) => setStatusState({ lot, status })}
      />
      <LotFormDialog
        open={formState !== null}
        mode={formState?.mode ?? 'create'}
        lot={formState?.lot ?? null}
        blocks={blocks}
        pending={pending}
        onClose={() => setFormState(null)}
        onSubmit={submitLot}
      />
      <ConfirmDialog
        open={statusState !== null}
        title={statusState?.status === 'BLOCKED' ? 'Bloquear lote' : 'Desbloquear lote'}
        description={statusState ? `¿Confirmas ${statusState.status === 'BLOCKED' ? 'bloquear' : 'desbloquear'} el lote ${statusState.lot.code}?` : ''}
        confirmLabel={statusState?.status === 'BLOCKED' ? 'Bloquear' : 'Desbloquear'}
        pending={mutations.changeStatus.isPending}
        onClose={() => setStatusState(null)}
        onConfirm={confirmStatusChange}
      />
      <Snackbar open={feedback !== null} autoHideDuration={5000} onClose={() => setFeedback(null)}>
        <Alert onClose={() => setFeedback(null)} severity={feedback?.severity ?? 'success'} sx={{ width: '100%' }}>
          {feedback?.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  )
}
