import { FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material/Select'
import type { LotBlockOption } from '../../domain/entities/Lot'
import { lotStatuses, type LotStatus } from '../../domain/entities/Lot'
import type { Lotification } from '../../domain/entities/Lotification'

export type LotsFiltersValue = {
  lotificationId: number | ''
  search: string
  blockId: number | ''
  status: LotStatus | ''
}

type LotsFiltersProps = {
  blocks: LotBlockOption[]
  lotifications: Lotification[]
  value: LotsFiltersValue
  onChange(value: LotsFiltersValue): void
  showLotification?: boolean
}

export function LotsFilters({ blocks, lotifications, value, onChange, showLotification = true }: LotsFiltersProps) {
  function update(next: Partial<LotsFiltersValue>) {
    onChange({ ...value, ...next })
  }

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} sx={{ alignItems: { md: 'center' } }}>
      {showLotification ? <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 220 }, flex: { md: '0 0 220px' } }}>
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
      </FormControl> : null}
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
