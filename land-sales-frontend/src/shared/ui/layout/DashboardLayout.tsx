import LogoutIcon from '@mui/icons-material/Logout'
import MapIcon from '@mui/icons-material/Map'
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../../features/auth/ui/hooks/useAuth'

export function DashboardLayout() {
  const { user, logout } = useAuth()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <MapIcon color="primary" sx={{ mr: 1.5 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Land Sales
          </Typography>
          <Typography color="text.secondary" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
            {user?.fullName ?? user?.username}
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
            Salir
          </Button>
        </Toolbar>
      </AppBar>
      <Outlet />
    </Box>
  )
}
