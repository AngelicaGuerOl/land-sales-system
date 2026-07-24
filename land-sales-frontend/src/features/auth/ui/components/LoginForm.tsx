import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError } from '../../../../shared/api/apiError'
import { useAuth } from '../hooks/useAuth'
import { loginSchema, type LoginFormValues } from '../schemas/loginSchema'

export function LoginForm() {
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    setError(null)
    try {
      await login(values)
    } catch (caught) {
      setError(caught instanceof ApiError && caught.status === 401 ? 'Usuario o contraseña inválidos' : 'No fue posible iniciar sesión')
    }
  }

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <TextField
        label="Usuario"
        autoComplete="username"
        error={Boolean(errors.username)}
        helperText={errors.username?.message}
        {...register('username')}
      />
      <TextField
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
        Entrar
      </Button>
    </Stack>
  )
}
