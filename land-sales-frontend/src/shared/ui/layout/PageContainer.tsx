import { Box } from '@mui/material'
import type { ReactNode } from 'react'

type PageContainerProps = {
  children: ReactNode
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <Box sx={{ maxWidth: '1440px', mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
      {children}
    </Box>
  )
}
