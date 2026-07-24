import AddIcon from '@mui/icons-material/Add'
import { Alert, Button, Card, CardContent, MenuItem, Select, Snackbar, Stack, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../../../shared/api/apiError'
import { EmptyState } from '../../../../shared/ui/components/EmptyState'
import { LoadingScreen } from '../../../../shared/ui/components/LoadingScreen'
import { PageContainer } from '../../../../shared/ui/layout/PageContainer'
import type { BlockFormInput, LandBlock } from '../../domain/entities/LandBlock'
import { useBlockMutations } from '../hooks/useBlockMutations'
import { useBlocks } from '../hooks/useBlocks'
import { useLotifications } from '../hooks/useLotifications'
import { ConfirmDialog } from '../../../../shared/ui/components/ConfirmDialog'
import { BlockFormDialog } from '../components/BlockFormDialog'
import { BulkLotDialog } from '../components/BulkLotDialog'
import { BlocksTable } from '../components/BlocksTable'
import type { BulkLotInput } from '../../domain/entities/LandBlock'
import { useBulkLotMutation } from '../hooks/useBulkLotMutation'

type Feedback = { message: string; severity: 'success' | 'error' }

function errorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return 'No fue posible completar la operación.'
  const details = error.details as { validationErrors?: Record<string, string> } | undefined
  const conflicts = details?.validationErrors?.conflicts
  if (error.status === 400) return 'Revisa los datos capturados.'
  if (error.status === 404) return 'La manzana o lotificación ya no existe.'
  if (error.status === 409) return conflicts ? `Ya existen lotes en conflicto: ${conflicts}` : error.message || 'La manzana tiene datos en conflicto.'
  return 'No fue posible completar la operación.'
}

export function BlocksPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const lotificationsQuery = useLotifications()
  const lotifications = (lotificationsQuery.data ?? []).filter((lotification) => lotification.active)
  const [selectedLotificationId, setSelectedLotificationId] = useState<number | null>(null)
  const [formBlock, setFormBlock] = useState<LandBlock | null | undefined>(undefined)
  const [deleteBlock, setDeleteBlock] = useState<LandBlock | null>(null)
  const [bulkBlock, setBulkBlock] = useState<LandBlock | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const activeLotificationId = selectedLotificationId ?? lotifications[0]?.id ?? null
  const blocksQuery = useBlocks(activeLotificationId)
  const mutations = useBlockMutations()
  const bulkMutation = useBulkLotMutation()

  if (lotificationsQuery.isLoading) return <LoadingScreen message="Cargando lotificaciones..." />
  if (lotificationsQuery.isError) return <PageContainer><Alert severity="error">No fue posible cargar las lotificaciones.</Alert></PageContainer>
  if (lotifications.length === 0) return <PageContainer><EmptyState title="Sin lotificaciones activas" description="No hay lotificaciones activas disponibles para consultar." /></PageContainer>

  const blocks = blocksQuery.data ?? []
  const plannedLots = blocks.reduce((total, block) => total + block.plannedLotCount, 0)
  const registeredLots = blocks.reduce((total, block) => total + block.registeredLotCount, 0)
  const pendingLots = Math.max(plannedLots - registeredLots, 0)
  const busy = mutations.create.isPending || mutations.update.isPending || mutations.remove.isPending

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ['blocks'] })
  }

  function saveBlock(input: BlockFormInput) {
    const onSuccess = async () => {
      await refresh()
      setFormBlock(undefined)
      setFeedback({ message: 'Manzana guardada correctamente.', severity: 'success' })
    }
    const onError = (error: unknown) => setFeedback({ message: errorMessage(error), severity: 'error' })
    if (formBlock) mutations.update.mutate({ id: formBlock.id, input }, { onSuccess, onError })
    else mutations.create.mutate(input, { onSuccess, onError })
  }

  function removeBlock() {
    if (!deleteBlock) return
    mutations.remove.mutate(deleteBlock.id, {
      onSuccess: async () => { await refresh(); setDeleteBlock(null); setFeedback({ message: 'Manzana eliminada correctamente.', severity: 'success' }) },
      onError: (error) => { setDeleteBlock(null); setFeedback({ message: errorMessage(error), severity: 'error' }) },
    })
  }

  function generateLots(input: BulkLotInput) {
    if (!bulkBlock) return
    bulkMutation.mutate({ blockId: bulkBlock.id, input }, {
      onSuccess: async (result) => {
        await queryClient.invalidateQueries({ queryKey: ['blocks'] })
        await queryClient.invalidateQueries({ queryKey: ['lots'] })
        setBulkBlock(null)
        setFeedback({ message: `${result.createdCount} lotes generados correctamente.`, severity: 'success' })
      },
      onError: (error) => setFeedback({ message: errorMessage(error), severity: 'error' }),
    })
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
          <Stack spacing={0.5}><Typography variant="h4" sx={{ fontWeight: 700 }}>Manzanas</Typography><Typography color="text.secondary">Administra la distribución y capacidad de cada manzana.</Typography></Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {lotifications.length > 1 ? <Select size="small" value={activeLotificationId ?? ''} onChange={(event) => setSelectedLotificationId(Number(event.target.value))} aria-label="Lotificación" sx={{ minWidth: 220 }}>{lotifications.map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}</Select> : null}
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormBlock(null)}>Registrar manzana</Button>
          </Stack>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Metric label="Total de manzanas" value={blocks.length} />
          <Metric label="Lotes registrados" value={registeredLots} />
          <Metric label="Pendientes por registrar" value={pendingLots} />
        </Stack>
        {blocksQuery.isLoading ? <LoadingScreen message="Cargando manzanas..." /> : null}
        {blocksQuery.isError ? <Alert severity="error">No fue posible cargar las manzanas.</Alert> : null}
        {!blocksQuery.isLoading && !blocksQuery.isError && blocks.length === 0 ? <EmptyState title="Sin manzanas" description="Registra la primera manzana de esta lotificación." /> : null}
        {!blocksQuery.isLoading && !blocksQuery.isError && blocks.length > 0 ? <BlocksTable blocks={blocks} onViewLots={(block) => navigate(`/lotes?lotificationId=${block.lotificationId}&blockId=${block.id}`)} onEdit={(block) => setFormBlock(block)} onDelete={(block) => setDeleteBlock(block)} onGenerate={(block) => setBulkBlock(block)} /> : null}
      </Stack>
      <BlockFormDialog key={`${formBlock?.id ?? 'new'}-${formBlock !== undefined}`} open={formBlock !== undefined} block={formBlock ?? null} defaultLotificationId={activeLotificationId} pending={busy} onClose={() => setFormBlock(undefined)} onSubmit={saveBlock} />
      <BulkLotDialog open={bulkBlock !== null} block={bulkBlock} pending={bulkMutation.isPending} onClose={() => setBulkBlock(null)} onSubmit={generateLots} />
      <ConfirmDialog open={deleteBlock !== null} title="Eliminar manzana" description={deleteBlock ? `¿Confirmas eliminar la manzana ${deleteBlock.code}?` : ''} confirmLabel="Eliminar" pending={mutations.remove.isPending} onClose={() => setDeleteBlock(null)} onConfirm={removeBlock} />
      <Snackbar open={feedback !== null} autoHideDuration={5000} onClose={() => setFeedback(null)}><Alert severity={feedback?.severity ?? 'success'} onClose={() => setFeedback(null)} sx={{ width: '100%' }}>{feedback?.message}</Alert></Snackbar>
    </PageContainer>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return <Card variant="outlined" sx={{ flex: 1, minWidth: 160 }}><CardContent><Typography variant="body2" color="text.secondary">{label}</Typography><Typography variant="h5" sx={{ mt: 0.5, fontWeight: 800 }}>{value.toLocaleString('es-MX')}</Typography></CardContent></Card>
}
