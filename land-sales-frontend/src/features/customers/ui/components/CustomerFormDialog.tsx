import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { Customer, CustomerFormInput } from '../../domain/entities/Customer'
import { customerFormSchema, type CustomerFormValues } from '../schemas/customerFormSchema'

type Props = {
  open: boolean
  customer: Customer | null
  pending: boolean
  onClose(): void
  onSubmit(input: CustomerFormInput): void
}

const emptyValues: CustomerFormValues = { fullName: '', phone: '', alternatePhone: '', address: '' }

export function CustomerFormDialog({ open, customer, pending, onClose, onSubmit }: Props) {
  const { register, handleSubmit, reset, setValue, control, formState: { errors, isValid } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    mode: 'onChange',
    defaultValues: emptyValues,
  })

  useEffect(() => {
    reset(customer ? {
      fullName: customer.fullName,
      phone: customer.phone,
      alternatePhone: customer.alternatePhone ?? '',
      address: customer.address ?? '',
    } : emptyValues)
  }, [customer, reset, open])

  const phone = useWatch({ control, name: 'phone' }) ?? ''
  const alternatePhone = useWatch({ control, name: 'alternatePhone' }) ?? ''
  const updatePhone = (field: 'phone' | 'alternatePhone', value: string) => {
    if ((value.match(/\d/g) ?? []).length <= 10) setValue(field, value, { shouldDirty: true, shouldValidate: true })
  }

  function submit(values: CustomerFormValues) {
    onSubmit({
      fullName: values.fullName.trim(),
      phone: values.phone.trim(),
      alternatePhone: values.alternatePhone.trim() || null,
      address: values.address.trim() || null,
    })
  }

  return (
    <Dialog open={open} onClose={pending ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{customer ? 'Editar cliente' : 'Registrar cliente'}</DialogTitle>
      <DialogContent dividers>
        <Stack component="form" id="customer-form" onSubmit={handleSubmit(submit)} spacing={2} sx={{ pt: 1 }}>
          <TextField label="Nombre completo" required autoFocus {...register('fullName')} error={Boolean(errors.fullName)} helperText={errors.fullName?.message} disabled={pending} />
          <TextField label="Teléfono principal" required {...register('phone')} value={phone} onChange={(event) => updatePhone('phone', event.target.value)} error={Boolean(errors.phone)} helperText={errors.phone?.message} disabled={pending} />
          <TextField label="Teléfono alternativo" {...register('alternatePhone')} value={alternatePhone} onChange={(event) => updatePhone('alternatePhone', event.target.value)} error={Boolean(errors.alternatePhone)} helperText={errors.alternatePhone?.message} disabled={pending} />
          <TextField label="Domicilio completo" multiline minRows={3} {...register('address')} error={Boolean(errors.address)} helperText={errors.address?.message} disabled={pending} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={pending}>Cancelar</Button>
        <Button type="submit" form="customer-form" variant="contained" disabled={pending || !isValid}>{pending ? 'Guardando...' : customer ? 'Guardar cambios' : 'Guardar cliente'}</Button>
      </DialogActions>
    </Dialog>
  )
}
