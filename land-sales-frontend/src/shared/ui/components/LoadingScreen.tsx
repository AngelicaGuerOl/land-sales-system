import { Box, CircularProgress, Stack, Typography } from '@mui/material'

type LoadingScreenProps = {
  message?: string
}

export function LoadingScreen({ message = 'Cargando...' }: LoadingScreenProps) {
  return (
    <Box sx={{ minHeight: '320px', display: 'grid', placeItems: 'center' }}>
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <CircularProgress />
        <Typography color="text.secondary">{message}</Typography>
      </Stack>
    </Box>
  )
}
