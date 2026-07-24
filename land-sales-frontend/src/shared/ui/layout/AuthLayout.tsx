import { Box, Paper, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type AuthLayoutProps = {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
      <Box sx={{ display: 'grid', placeItems: 'center', px: 3, py: 6, bgcolor: 'background.default' }}>
        <Paper elevation={0} sx={{ width: '100%', maxWidth: 420, p: 4, border: 1, borderColor: 'divider' }}>
          {children}
        </Paper>
      </Box>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 6,
          color: 'common.white',
          background:
            'linear-gradient(135deg, rgba(18,94,74,.95), rgba(28,44,71,.94)), url(/src/assets/hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          Land Sales
        </Typography>
        <Typography variant="h6" sx={{ maxWidth: 520, mt: 2 }}>
          Administración de lotificación, manzanas y lotes desde un mapa operativo.
        </Typography>
      </Box>
    </Box>
  )
}
