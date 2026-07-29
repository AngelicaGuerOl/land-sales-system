import { zodResolver } from '@hookform/resolvers/zod'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Backdrop,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError } from '../../../../shared/api/apiError'
import { useAuth } from '../hooks/useAuth'
import { loginSchema, type LoginFormValues } from '../schemas/loginSchema'

export function LoginForm() {
  const { login, loginDemo } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false)
  const [showColdStartMessage, setShowColdStartMessage] = useState(false)
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
  const isBusy = isSubmitting || isDemoSubmitting
  const loadingLabel = isDemoSubmitting ? 'Preparando la demo...' : 'Iniciando sesión...'

  useEffect(() => {
    if (!isBusy) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setShowColdStartMessage(true)
    }, 8_000)

    return () => window.clearTimeout(timeoutId)
  }, [isBusy])

  function resolveLoginError(caught: unknown, fallbackMessage: string) {
    if (caught instanceof ApiError && caught.status === 0) {
      return 'El servidor tardó más de lo esperado. Intenta nuevamente.'
    }

    if (caught instanceof ApiError && caught.status === 401) {
      return 'Usuario o contraseña inválidos'
    }

    return fallbackMessage
  }

  async function onSubmit(values: LoginFormValues) {
    if (isBusy) {
      return
    }
    setError(null)
    setShowColdStartMessage(false)
    try {
      await login(values)
    } catch (caught) {
      setError(resolveLoginError(caught, 'No fue posible iniciar sesión. Intenta nuevamente en unos segundos.'))
    } finally {
      setShowColdStartMessage(false)
    }
  }

  async function handleDemoLogin() {
    if (isBusy) {
      return
    }
    setError(null)
    setShowColdStartMessage(false)
    setIsDemoSubmitting(true)
    try {
      await loginDemo()
    } catch (caught) {
      setError(resolveLoginError(caught, 'No fue posible preparar la demo. Intenta nuevamente en unos segundos.'))
    } finally {
      setShowColdStartMessage(false)
      setIsDemoSubmitting(false)
    }
  }

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Backdrop
        open={isBusy}
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 1,
          bgcolor: 'rgba(244, 246, 248, 0.72)',
          backdropFilter: 'blur(2px)',
        }}
      >
        <Stack
          spacing={1.5}
          sx={{
            alignItems: 'center',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 4,
            px: 3,
            py: 2.5,
          }}
        >
          <CircularProgress size={32} />
          <Typography sx={{ fontWeight: 700 }}>{loadingLabel}</Typography>
        </Stack>
      </Backdrop>
      <Stack spacing={1}>
        <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: 0 }}>
          Land Sales
        </Typography>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
          Bienvenido
        </Typography>
        <Typography color="text.secondary">
          Inicia sesión para administrar lotes, clientes, ventas y pagos.
        </Typography>
      </Stack>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {showColdStartMessage ? (
        <Alert severity="info">
          El servidor de demostración está iniciando. Esto puede tardar unos segundos.
        </Alert>
      ) : null}
      <TextField
        label="Usuario"
        placeholder="Escribe tu usuario"
        autoComplete="username"
        disabled={isBusy}
        error={Boolean(errors.username)}
        helperText={errors.username?.message}
        {...register('username')}
      />
      <TextField
        label="Contraseña"
        placeholder="Escribe tu contraseña"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        disabled={isBusy}
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  edge="end"
                  onClick={() => setShowPassword((visible) => !visible)}
                  disabled={isBusy}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        {...register('password')}
      />
      <Button type="submit" variant="contained" size="large" disabled={isBusy}>
        {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>
      <Divider>
        <Box component="span" sx={{ px: 1, color: 'text.secondary' }}>
          o
        </Box>
      </Divider>
      <Button type="button" variant="outlined" size="large" disabled={isBusy} onClick={handleDemoLogin}>
        {isDemoSubmitting ? 'Preparando la demo...' : 'Explorar la demo'}
      </Button>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        El primer acceso puede tardar unos segundos.
      </Typography>
    </Stack>
  )
}
