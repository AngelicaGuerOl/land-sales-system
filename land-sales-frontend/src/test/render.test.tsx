import { Button, Stack, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from './render'

function ProviderProbe() {
  const location = useLocation()
  const queryClient = useQueryClient()
  const retryDisabled = queryClient.getDefaultOptions().queries?.retry === false

  return (
    <Stack>
      <Typography>Ruta actual: {location.pathname}</Typography>
      <Typography>QueryClient aislado: {retryDisabled ? 'si' : 'no'}</Typography>
      <Button component={Link} to="/siguiente" variant="contained">
        Ir a siguiente ruta
      </Button>
    </Stack>
  )
}

describe('renderWithProviders', () => {
  it('renders with Material UI, MemoryRouter and QueryClientProvider', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ProviderProbe />, { initialEntries: ['/inicial'] })

    expect(screen.getByText('Ruta actual: /inicial')).toBeInTheDocument()
    expect(screen.getByText('QueryClient aislado: si')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Ir a siguiente ruta' }))

    expect(screen.getByText('Ruta actual: /siguiente')).toBeInTheDocument()
  })
})
