import { Alert, Box, Grid, Paper, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { EmptyState } from '../../../../shared/ui/components/EmptyState'
import { LoadingScreen } from '../../../../shared/ui/components/LoadingScreen'
import { PageContainer } from '../../../../shared/ui/layout/PageContainer'
import type { Lot } from '../../domain/entities/Lot'
import { LotDetailsPanel } from '../components/LotDetailsPanel'
import { LotMapCanvas } from '../components/LotMapCanvas'
import { LotMapFilters, type LotMapFiltersValue } from '../components/LotMapFilters'
import { useLotificationMap } from '../hooks/useLotificationMap'
import { useLotifications } from '../hooks/useLotifications'

const initialFilters: LotMapFiltersValue = {
  lotificationId: '',
  search: '',
  blockId: '',
  status: '',
}

function matchesSearch(lot: Lot, search: string) {
  const normalized = search.trim().toLowerCase()
  return !normalized || lot.code.toLowerCase().includes(normalized) || lot.lotNumber.toLowerCase().includes(normalized)
}

export function LotMapPage() {
  const [filters, setFilters] = useState<LotMapFiltersValue>(initialFilters)
  const [selectedLotId, setSelectedLotId] = useState<number | null>(null)
  const lotificationsQuery = useLotifications()
  const lotifications = lotificationsQuery.data ?? []
  const selectedLotificationId = filters.lotificationId === '' ? lotifications[0]?.id ?? null : filters.lotificationId
  const mapQuery = useLotificationMap(selectedLotificationId)

  const filteredLots = useMemo(() => {
    const lots = mapQuery.data?.lots ?? []
    return lots.filter((lot) => {
      const blockMatches = filters.blockId === '' || lot.blockId === filters.blockId
      const statusMatches = filters.status === '' || lot.status === filters.status
      return blockMatches && statusMatches && matchesSearch(lot, filters.search)
    })
  }, [filters.blockId, filters.search, filters.status, mapQuery.data?.lots])

  const selectedLot = useMemo(
    () => filteredLots.find((lot) => lot.id === selectedLotId) ?? null,
    [filteredLots, selectedLotId],
  )

  if (lotificationsQuery.isLoading) {
    return <LoadingScreen message="Cargando lotificaciones..." />
  }

  if (lotificationsQuery.isError) {
    return (
      <PageContainer>
        <Alert severity="error">No fue posible cargar las lotificaciones.</Alert>
      </PageContainer>
    )
  }

  if (lotifications.length === 0) {
    return (
      <PageContainer>
        <EmptyState
          title="Sin lotificaciones"
          description="Aún no hay lotificaciones registradas para mostrar en el mapa."
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Mapa de lotes
          </Typography>
          <Typography color="text.secondary">
            Consulta lotificación, manzanas, lotes y estado comercial desde una sola vista.
          </Typography>
        </Stack>
        <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
          <LotMapFilters
            blocks={mapQuery.data?.blocks ?? []}
            lotifications={lotifications}
            value={{ ...filters, lotificationId: selectedLotificationId ?? '' }}
            onChange={(next) => {
              setSelectedLotId(null)
              setFilters(next)
            }}
          />
        </Paper>
        {mapQuery.isLoading ? <LoadingScreen message="Cargando mapa..." /> : null}
        {mapQuery.isError ? <Alert severity="error">No fue posible cargar el mapa de la lotificación.</Alert> : null}
        {mapQuery.data ? (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6">{mapQuery.data.lotification.name}</Typography>
                  <Typography color="text.secondary">
                    {filteredLots.length} lote(s) encontrado(s)
                  </Typography>
                </Box>
                {filteredLots.length === 0 ? (
                  <EmptyState title="Sin resultados" description="Ajusta la búsqueda, manzana o estado seleccionado." />
                ) : (
                  <LotMapCanvas
                    lots={filteredLots}
                    selectedLotId={selectedLotId}
                    viewBox={mapQuery.data.lotification.svgViewBox}
                    onSelectLot={(lot) => setSelectedLotId(lot.id)}
                  />
                )}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <LotDetailsPanel lot={selectedLot} />
            </Grid>
          </Grid>
        ) : null}
      </Stack>
    </PageContainer>
  )
}
