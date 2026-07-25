import { TextField } from '@mui/material'
import { Controller, type Control, type FieldPath } from 'react-hook-form'
import type { SaleFormValues } from '../schemas/saleSchema'

type MoneyFieldName = Extract<FieldPath<SaleFormValues>, `lots.${number}.agreedPrice` | `lots.${number}.downPayment`>

type MoneyInputProps = {
  control: Control<SaleFormValues>
  name: MoneyFieldName
  label: string
}

const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

export function MoneyInput({ control, name, label }: MoneyInputProps) {
  return <Controller control={control} name={name} render={({ field, fieldState }) => <TextField
    {...field}
    fullWidth
    type="text"
    label={label}
    value={typeof field.value === 'number' && Number.isFinite(field.value) ? formatter.format(field.value) : ''}
    inputMode="decimal"
    error={Boolean(fieldState.error)}
    helperText={fieldState.error?.message}
    onChange={(event) => {
      const rawValue = event.target.value.replace(/,/g, '').replace(/[^0-9.]/g, '')
      field.onChange(rawValue === '' ? Number.NaN : Number(rawValue))
    }}
  />} />
}
