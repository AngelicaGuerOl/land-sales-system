import { Button, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { routePaths } from '../../routes/routePaths'
import { PageContainer } from '../layout/PageContainer'

export function NotFoundPage() {
  return (
    <PageContainer>
      <Stack spacing={2}>
        <Typography variant="h4">Página no encontrada</Typography>
        <Typography color="text.secondary">La ruta solicitada no existe.</Typography>
        <Button component={RouterLink} to={routePaths.lotMap} variant="contained" sx={{ alignSelf: 'flex-start' }}>
          Ir al mapa
        </Button>
      </Stack>
    </PageContainer>
  )
}
