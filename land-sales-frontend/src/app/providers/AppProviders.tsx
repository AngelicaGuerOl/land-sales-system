import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { AuthProvider } from '../../features/auth'
import { setUnauthorizedHandler } from '../../shared/api/httpClient'
import { tokenStorage } from '../../shared/lib/storage/tokenStorage'
import { routePaths } from '../../shared/routes/routePaths'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#136f63',
    },
    secondary: {
      main: '#3454d1',
    },
    background: {
      default: '#f4f6f8',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
})

type AppProvidersProps = {
  children: ReactNode
}

function UnauthorizedRedirectHandler() {
  const navigate = useNavigate()
  const client = useQueryClient()

  useEffect(() => {
    setUnauthorizedHandler(() => {
      tokenStorage.clear()
      client.clear()
      navigate(routePaths.login, { replace: true })
    })

    return () => setUnauthorizedHandler(null)
  }, [client, navigate])

  return null
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <UnauthorizedRedirectHandler />
          <AuthProvider>{children}</AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
