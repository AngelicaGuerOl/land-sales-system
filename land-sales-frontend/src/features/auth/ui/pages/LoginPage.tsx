import { Stack, Typography } from '@mui/material'
import { AuthLayout } from '../../../../shared/ui/layout/AuthLayout'
import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  return (
    <AuthLayout>
      <Stack spacing={3}>
        <Stack spacing={0.75}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Iniciar sesión
          </Typography>
          <Typography color="text.secondary">
            Accede para consultar el mapa de lotes.
          </Typography>
        </Stack>
        <LoginForm />
      </Stack>
    </AuthLayout>
  )
}
