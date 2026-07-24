import { Chip } from '@mui/material'

export function CustomerStatusChip({ active }: { active: boolean }) {
  return <Chip size="small" color={active ? 'success' : 'default'} label={active ? 'Activo' : 'Inactivo'} />
}
