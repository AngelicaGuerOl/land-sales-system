import { FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material/Select'
import type { LotBlockOption } from '../../domain/entities/Lot'
import { lotStatuses, type LotStatus } from '../../domain/entities/Lot'

export type LotsFiltersValue = {
  search: string
  blockId: number | ''
  status: LotStatus | ''
}

type LotsFiltersProps = {
  blocks: LotBlockOption[]
  value: LotsFiltersValue
  onChange(value: LotsFiltersValue): void
  showLotification?: boolean
}

export function LotsFilters({ blocks, value, onChange }: LotsFiltersProps) {
  function update(next: Partial<LotsFiltersValue>) {
    onChange({ ...value, ...next })
  }

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} sx={{ alignItems: { md: 'center' } }}>
      <TextField
        label="Código o número"
        placeholder="Código o número"
        size="small"
        value={value.search}
        onChange={(event) => update({ search: event.target.value })}
        sx={{ minWidth: { md: 260 }, flex: 1 }}
      />
      <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 180 }, flex: { md: '0 0 180px' } }}>
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
      <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 180 }, flex: { md: '0 0 180px' } }}>
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
              {status === 'AVAILABLE' ? 'Disponible' : status === 'SOLD' ? 'Vendido' : 'Bloqueado'}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  )
}
