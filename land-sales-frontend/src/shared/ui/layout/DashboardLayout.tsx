import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined'
import LandscapeOutlinedIcon from '@mui/icons-material/LandscapeOutlined'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import { AppBar, Box, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../../features/auth/ui/hooks/useAuth'
import { routePaths } from '../../routes/routePaths'

const expandedWidth = 240
const collapsedWidth = 72

const navigation = [
  { label: 'Lotes', path: routePaths.lots, icon: <LandscapeOutlinedIcon /> },
  { label: 'Manzanas', path: routePaths.blocks, icon: <GridViewOutlinedIcon /> },
  { label: 'Plano de referencia', path: routePaths.referencePlan, icon: <MapOutlinedIcon /> },
]

const customerNavigation = [
  { label: 'Clientes', path: routePaths.customers, icon: <PeopleAltOutlinedIcon /> },
]

const salesNavigation = [
  { label: 'Nueva venta', path: routePaths.newSale, icon: <PointOfSaleOutlinedIcon /> },
  { label: 'Historial de ventas', path: routePaths.sales, icon: <ReceiptLongOutlinedIcon /> },
]

const collectionNavigation = [
  { label: 'Estado de cuenta', path: routePaths.accountStatements, icon: <AccountBalanceWalletOutlinedIcon /> },
  { label: 'Historial de pagos', path: routePaths.payments, icon: <ReceiptLongOutlinedIcon /> },
]

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const drawerWidth = isMobile ? 280 : collapsed ? collapsedWidth : expandedWidth

  function closeMobile() {
    if (isMobile) setMobileOpen(false)
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ minHeight: 72, px: collapsed && !isMobile ? 1.5 : 2, justifyContent: collapsed && !isMobile ? 'center' : 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
          <LandscapeOutlinedIcon color="primary" />
          {(!collapsed || isMobile) && <Typography variant="h6" noWrap sx={{ fontWeight: 800 }}>Land Sales</Typography>}
        </Box>
        {!isMobile ? <IconButton aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'} onClick={() => setCollapsed((value) => !value)}>{collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}</IconButton> : null}
      </Toolbar>
      <Divider />
      <List sx={{ px: collapsed && !isMobile ? 1 : 1.5, py: 1 }}>
        {(() => {
          const active = location.pathname === routePaths.dashboard
          const button = <ListItemButton component={RouterLink} to={routePaths.dashboard} selected={active} onClick={closeMobile} sx={{ minHeight: 46, justifyContent: collapsed && !isMobile ? 'center' : 'initial', px: collapsed && !isMobile ? 1.25 : 1.5, borderRadius: 1.5, '&.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText', '& .MuiListItemIcon-root': { color: 'inherit' } }, '&.Mui-selected:hover': { bgcolor: 'primary.dark' } }}><ListItemIcon sx={{ minWidth: collapsed && !isMobile ? 0 : 38, justifyContent: 'center', color: active ? 'inherit' : 'text.secondary' }}><DashboardOutlinedIcon /></ListItemIcon>{(!collapsed || isMobile) && <ListItemText primary={<Typography component="span" sx={{ fontWeight: active ? 700 : 500 }}>Dashboard</Typography>} />}</ListItemButton>
          return collapsed && !isMobile ? <Tooltip title="Dashboard" placement="right">{button}</Tooltip> : button
        })()}
      </List>
      <Box sx={{ px: collapsed && !isMobile ? 1 : 2, pt: 2, pb: 1 }}>
        {(!collapsed || isMobile) && <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1.2 }}>VENTAS</Typography>}
      </Box>
      <List sx={{ px: collapsed && !isMobile ? 1 : 1.5, pt: 0 }}>
        {salesNavigation.map((item) => {
          const active = location.pathname === item.path || (item.path === routePaths.sales && location.pathname.startsWith(`${item.path}/`) && location.pathname !== routePaths.newSale)
          const button = <ListItemButton component={RouterLink} to={item.path} selected={active} onClick={closeMobile} sx={{ minHeight: 46, justifyContent: collapsed && !isMobile ? 'center' : 'initial', px: collapsed && !isMobile ? 1.25 : 1.5, borderRadius: 1.5, mb: 0.5, '&.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText', '& .MuiListItemIcon-root': { color: 'inherit' } }, '&.Mui-selected:hover': { bgcolor: 'primary.dark' } }}>
            <ListItemIcon sx={{ minWidth: collapsed && !isMobile ? 0 : 38, justifyContent: 'center', color: active ? 'inherit' : 'text.secondary' }}>{item.icon}</ListItemIcon>
            {(!collapsed || isMobile) && <ListItemText primary={<Typography component="span" sx={{ fontWeight: active ? 700 : 500 }}>{item.label}</Typography>} />}
          </ListItemButton>
          return collapsed && !isMobile ? <Tooltip key={item.path} title={item.label} placement="right">{button}</Tooltip> : <Box key={item.path}>{button}</Box>
        })}
      </List>
      <Box sx={{ px: collapsed && !isMobile ? 1 : 2, pt: 3, pb: 1 }}>
        {(!collapsed || isMobile) && <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1.2 }}>COBRANZA</Typography>}
      </Box>
      <List sx={{ px: collapsed && !isMobile ? 1 : 1.5, pt: 0 }}>
        {collectionNavigation.map((item) => {
          const active = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
          const button = <ListItemButton component={RouterLink} to={item.path} selected={active} onClick={closeMobile} sx={{ minHeight: 46, justifyContent: collapsed && !isMobile ? 'center' : 'initial', px: collapsed && !isMobile ? 1.25 : 1.5, borderRadius: 1.5, mb: 0.5, '&.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText', '& .MuiListItemIcon-root': { color: 'inherit' } }, '&.Mui-selected:hover': { bgcolor: 'primary.dark' } }}>
            <ListItemIcon sx={{ minWidth: collapsed && !isMobile ? 0 : 38, justifyContent: 'center', color: active ? 'inherit' : 'text.secondary' }}>{item.icon}</ListItemIcon>
            {(!collapsed || isMobile) && <ListItemText primary={<Typography component="span" sx={{ fontWeight: active ? 700 : 500 }}>{item.label}</Typography>} />}
          </ListItemButton>
          return collapsed && !isMobile ? <Tooltip key={item.path} title={item.label} placement="right">{button}</Tooltip> : <Box key={item.path}>{button}</Box>
        })}
      </List>
      <Box sx={{ px: collapsed && !isMobile ? 1 : 2, pt: 3, pb: 1 }}>
        {(!collapsed || isMobile) && <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1.2 }}>TERRENOS</Typography>}
      </Box>
      <List sx={{ px: collapsed && !isMobile ? 1 : 1.5, pt: 0 }}>
        {navigation.map((item) => {
          const active = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
          const button = <ListItemButton component={RouterLink} to={item.path} selected={active} onClick={closeMobile} sx={{ minHeight: 46, justifyContent: collapsed && !isMobile ? 'center' : 'initial', px: collapsed && !isMobile ? 1.25 : 1.5, borderRadius: 1.5, mb: 0.5, '&.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText', '& .MuiListItemIcon-root': { color: 'inherit' } }, '&.Mui-selected:hover': { bgcolor: 'primary.dark' } }}>
            <ListItemIcon sx={{ minWidth: collapsed && !isMobile ? 0 : 38, justifyContent: 'center', color: active ? 'inherit' : 'text.secondary' }}>{item.icon}</ListItemIcon>
            {(!collapsed || isMobile) && <ListItemText primary={<Typography component="span" sx={{ fontWeight: active ? 700 : 500 }}>{item.label}</Typography>} />}
          </ListItemButton>
          return collapsed && !isMobile ? <Tooltip key={item.path} title={item.label} placement="right">{button}</Tooltip> : <Box key={item.path}>{button}</Box>
        })}
      </List>
      <Box sx={{ px: collapsed && !isMobile ? 1 : 2, pt: 2, pb: 1 }}>
        {(!collapsed || isMobile) && <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1.2 }}>CLIENTES</Typography>}
      </Box>
      <List sx={{ px: collapsed && !isMobile ? 1 : 1.5, pt: 0 }}>
        {customerNavigation.map((item) => {
          const active = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
          const button = <ListItemButton component={RouterLink} to={item.path} selected={active} onClick={closeMobile} sx={{ minHeight: 46, justifyContent: collapsed && !isMobile ? 'center' : 'initial', px: collapsed && !isMobile ? 1.25 : 1.5, borderRadius: 1.5, mb: 0.5, '&.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText', '& .MuiListItemIcon-root': { color: 'inherit' } }, '&.Mui-selected:hover': { bgcolor: 'primary.dark' } }}>
            <ListItemIcon sx={{ minWidth: collapsed && !isMobile ? 0 : 38, justifyContent: 'center', color: active ? 'inherit' : 'text.secondary' }}>{item.icon}</ListItemIcon>
            {(!collapsed || isMobile) && <ListItemText primary={<Typography component="span" sx={{ fontWeight: active ? 700 : 500 }}>{item.label}</Typography>} />}
          </ListItemButton>
          return collapsed && !isMobile ? <Tooltip key={item.path} title={item.label} placement="right">{button}</Tooltip> : <Box key={item.path}>{button}</Box>
        })}
      </List>
      <Box sx={{ mt: 'auto' }}>
        <Divider />
        <Box sx={{ p: collapsed && !isMobile ? 1 : 2, display: 'flex', alignItems: 'center', gap: 1.25, justifyContent: collapsed && !isMobile ? 'center' : 'initial' }}>
          <Box sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: 'secondary.main', color: 'secondary.contrastText', display: 'grid', placeItems: 'center', fontWeight: 700 }}>{(user?.fullName ?? user?.username ?? 'U').charAt(0).toUpperCase()}</Box>
          {(!collapsed || isMobile) && <Box sx={{ minWidth: 0, flex: 1 }}><Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{user?.fullName ?? user?.username}</Typography><Typography variant="caption" color="text.secondary" noWrap>{user?.username}</Typography></Box>}
        </Box>
        <Tooltip title={collapsed && !isMobile ? 'Cerrar sesión' : ''} placement="right">
          <ListItemButton onClick={logout} sx={{ mx: collapsed && !isMobile ? 1 : 1.5, mb: 1, borderRadius: 1.5, justifyContent: collapsed && !isMobile ? 'center' : 'initial', px: collapsed && !isMobile ? 1.25 : 1.5 }}>
            <ListItemIcon sx={{ minWidth: collapsed && !isMobile ? 0 : 38, justifyContent: 'center' }}><LogoutIcon /></ListItemIcon>
            {(!collapsed || isMobile) && <ListItemText primary="Cerrar sesión" />}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      <Drawer variant={isMobile ? 'temporary' : 'permanent'} open={isMobile ? mobileOpen : true} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: 1, borderColor: 'divider', transition: theme.transitions.create('width'), overflowX: 'hidden' } }}>{drawer}</Drawer>
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ display: { xs: 'block', md: 'none' }, borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar><IconButton edge="start" aria-label="Abrir menú" onClick={() => setMobileOpen(true)}><MenuIcon /></IconButton><Typography variant="h6" sx={{ ml: 1, fontWeight: 800 }}>Land Sales</Typography></Toolbar>
        </AppBar>
        <Outlet />
      </Box>
    </Box>
  )
}
