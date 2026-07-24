import { Alert, Box, Paper, Typography } from '@mui/material'
import type { Lot } from '../../domain/entities/Lot'

const fillByStatus: Record<Lot['status'], string> = {
  AVAILABLE: '#2e7d32',
  SOLD: '#607d8b',
  BLOCKED: '#ed6c02',
}

type LotMapCanvasProps = {
  lots: Lot[]
  selectedLotId: number | null
  viewBox: string | null
  onSelectLot(lot: Lot): void
}

export function LotMapCanvas({ lots, selectedLotId, viewBox, onSelectLot }: LotMapCanvasProps) {
  const lotsWithShapes = lots.filter((lot) => lot.svgPath)

  return (
    <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider', minHeight: 520 }}>
      {lotsWithShapes.length === 0 ? (
        <Box sx={{ height: 480, display: 'grid', placeItems: 'center' }}>
          <Alert severity="info" sx={{ maxWidth: 560 }}>
            Todavía no existen formas SVG para esta lotificación. Cuando se carguen los trazos, el mapa se
            renderizará aquí.
          </Alert>
        </Box>
      ) : (
        <Box sx={{ width: '100%', overflow: 'auto' }}>
          <svg
            viewBox={viewBox ?? '0 0 1200 800'}
            role="img"
            aria-label="Mapa de lotes"
            style={{ width: '100%', minWidth: 720, height: 520, display: 'block' }}
          >
            {lotsWithShapes.map((lot) => {
              const selected = lot.id === selectedLotId
              return (
                <g key={lot.id}>
                  <path
                    d={lot.svgPath ?? ''}
                    tabIndex={0}
                    role="button"
                    aria-label={`Lote ${lot.code}`}
                    onClick={() => onSelectLot(lot)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onSelectLot(lot)
                      }
                    }}
                    fill={fillByStatus[lot.status]}
                    fillOpacity={selected ? 0.82 : 0.52}
                    stroke={selected ? '#111827' : '#ffffff'}
                    strokeWidth={selected ? 4 : 2}
                    style={{ cursor: 'pointer', transition: 'fill-opacity 120ms ease, stroke-width 120ms ease' }}
                  />
                  {lot.labelX !== null && lot.labelY !== null ? (
                    <text
                      x={lot.labelX}
                      y={lot.labelY}
                      transform={
                        lot.rotation
                          ? `rotate(${lot.rotation} ${lot.labelX} ${lot.labelY})`
                          : undefined
                      }
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="18"
                      fontWeight="700"
                      fill="#111827"
                      pointerEvents="none"
                    >
                      {lot.lotNumber}
                    </text>
                  ) : null}
                </g>
              )
            })}
          </svg>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {lotsWithShapes.length} lote(s) con forma SVG visible(s).
          </Typography>
        </Box>
      )}
    </Paper>
  )
}
