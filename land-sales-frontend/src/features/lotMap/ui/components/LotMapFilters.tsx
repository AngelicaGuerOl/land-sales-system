import { FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material/Select'
import type { LandBlock } from '../../domain/entities/LandBlock'
import { lotStatuses, type LotStatus } from '../../domain/entities/Lot'
import type { Lotification } from '../../domain/entities/Lotification'

export type LotMapFiltersValue = {
  lotificationId: number | ''
  search: string
  blockId: number | ''
  status: LotStatus | ''
}

type LotMapFiltersProps = {
  blocks: LandBlock[]
  lotifications: Lotification[]
  value: LotMapFiltersValue
  onChange(value: LotMapFiltersValue): void
}

export function LotMapFilters({ blocks, lotifications, value, onChange }: LotMapFiltersProps) {
  function update(next: Partial<LotMapFiltersValue>) {
    onChange({ ...value, ...next })
  }

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
      <FormControl sx={{ minWidth: 240 }}>
        <InputLabel id="lotification-label">Lotificación</InputLabel>
        <Select
          labelId="lotification-label"
          label="Lotificación"
          value={value.lotificationId === '' ? '' : String(value.lotificationId)}
          onChange={(event: SelectChangeEvent) =>
            update({ lotificationId: event.target.value === '' ? '' : Number(event.target.value), blockId: '' })
          }
        >
          {lotifications.map((lotification) => (
            <MenuItem key={lotification.id} value={lotification.id}>
              {lotification.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Buscar lote"
        placeholder="Código o número"
        value={value.search}
        onChange={(event) => update({ search: event.target.value })}
        sx={{ minWidth: 220 }}
      />
      <FormControl sx={{ minWidth: 180 }}>
        <InputLabel id="block-label">Manzana</InputLabel>
        <Select
          labelId="block-label"
          label="Manzana"
          value={value.blockId === '' ? '' : String(value.blockId)}
          onChange={(event: SelectChangeEvent) =>
            update({ blockId: event.target.value === '' ? '' : Number(event.target.value) })
          }
        >
          <MenuItem value="">Todas</MenuItem>
          {blocks.map((block) => (
            <MenuItem key={block.id} value={block.id}>
              {block.code}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 180 }}>
        <InputLabel id="status-label">Estado</InputLabel>
        <Select
          labelId="status-label"
          label="Estado"
          value={value.status}
          onChange={(event: SelectChangeEvent) => update({ status: event.target.value as LotStatus | '' })}
        >
          <MenuItem value="">Todos</MenuItem>
          {lotStatuses.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  )
}
