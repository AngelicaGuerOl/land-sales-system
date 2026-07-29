import LandscapeOutlinedIcon from '@mui/icons-material/LandscapeOutlined'
import { Box, Paper } from '@mui/material'
import type { ReactNode } from 'react'

type AuthLayoutProps = {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 3 },
        py: { xs: 4, sm: 6 },
        position: 'relative',
        overflowX: 'hidden',
        bgcolor: 'background.default',
        background: [
          'linear-gradient(145deg, rgba(19,111,99,0.13) 0%, rgba(244,246,248,0.96) 38%, rgba(52,84,209,0.10) 100%)',
        ].join(','),
        '&::before': {
          content: '""',
          position: 'absolute',
          top: { xs: 28, md: 52 },
          right: { xs: -80, sm: -36, md: '10%' },
          width: { xs: 220, sm: 290, md: 340 },
          aspectRatio: '1 / 0.72',
          border: '1px solid rgba(19,111,99,0.16)',
          borderRadius: 2,
          transform: 'rotate(-7deg)',
          background: [
            'linear-gradient(90deg, transparent 0 26%, rgba(19,111,99,0.10) 26% 27%, transparent 27% 58%, rgba(52,84,209,0.08) 58% 59%, transparent 59%)',
            'linear-gradient(0deg, transparent 0 35%, rgba(19,111,99,0.09) 35% 36%, transparent 36% 70%, rgba(52,84,209,0.08) 70% 71%, transparent 71%)',
          ].join(','),
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          left: { xs: -86, sm: -42, md: '9%' },
          bottom: { xs: 30, md: 70 },
          width: { xs: 190, sm: 250, md: 300 },
          aspectRatio: '1 / 1',
          borderRadius: 2,
          border: '1px solid rgba(19,111,99,0.12)',
          clipPath: 'polygon(8% 12%, 92% 4%, 86% 38%, 96% 84%, 42% 94%, 6% 70%)',
          background: 'linear-gradient(120deg, rgba(255,255,255,0.42), rgba(19,111,99,0.06))',
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 460,
          p: { xs: 3, sm: 4.5 },
          border: 1,
          borderColor: 'rgba(19,111,99,0.12)',
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: '0 24px 60px rgba(22, 40, 58, 0.12)',
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            mb: 2,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            color: 'primary.main',
            bgcolor: 'rgba(19,111,99,0.10)',
          }}
          aria-hidden="true"
        >
          <LandscapeOutlinedIcon />
        </Box>
        {children}
      </Paper>
    </Box>
  )
}
