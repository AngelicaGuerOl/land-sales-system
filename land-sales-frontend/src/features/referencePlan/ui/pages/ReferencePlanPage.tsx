import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded'
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material'
import { useState, type WheelEvent } from 'react'
import { env } from '../../../../app/config/env'
import { PageContainer } from '../../../../shared/ui/layout/PageContainer'

const demoImageUrl = '/images/reference-plan/plan-reference-demo.png'

export function ReferencePlanPage() {
  const [expanded, setExpanded] = useState(false)
  const [scale, setScale] = useState(1)
  const [imageAvailable, setImageAvailable] = useState(true)
  const imageUrl = env.referencePlanImageUrl
  const isDemoPlan = imageUrl === demoImageUrl

  function openExpanded() {
    setScale(1)
    setExpanded(true)
  }

  function closeExpanded() {
    setExpanded(false)
    setScale(1)
  }

  function updateZoom(delta: number) {
    setScale((current) => Math.min(3, Math.max(1, Number((current + delta).toFixed(2)))))
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    if (!event.ctrlKey) return
    event.preventDefault()
    updateZoom(event.deltaY < 0 ? 0.1 : -0.1)
  }

  return (
    <PageContainer>
      <Stack spacing={2} sx={{ overflowX: 'hidden' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
          <Stack spacing={0.25}>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2rem' }, lineHeight: 1.15 }}>Plano de referencia</Typography>
            <Typography color="text.secondary">{isDemoPlan ? 'Plano demo con información ficticia.' : 'Consulta la distribución de manzanas y lotes.'}</Typography>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' } }}>
            <Button variant="contained" onClick={openExpanded} disabled={!imageAvailable} startIcon={<ZoomInRoundedIcon />}>Ver en grande</Button>
          </Stack>
        </Stack>
        <Paper
          variant="outlined"
          sx={{
            overflow: 'hidden',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 18px 46px rgba(22, 40, 58, 0.08)',
          }}
        >
          <Box sx={{ width: '100%', minHeight: { xs: 260, sm: 360, md: 520 }, display: 'flex', justifyContent: 'center', alignItems: 'center', p: { xs: 1, md: 2 }, overflow: 'hidden', bgcolor: 'grey.50' }}>
            {imageAvailable ? (
              <Box component="img" src={imageUrl} alt={isDemoPlan ? 'Plano de referencia demo con lotes y calles ficticias' : 'Plano de referencia con manzanas, calles y lotes'} onError={() => setImageAvailable(false)} onClick={openExpanded} sx={{ display: 'block', width: '100%', maxWidth: 1280, height: 'auto', objectFit: 'contain', cursor: 'zoom-in' }} />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                <Typography color="text.secondary" sx={{ textAlign: 'center' }}>No se pudo cargar el plano de referencia.</Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Stack>
      <Dialog fullScreen open={expanded} onClose={closeExpanded}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.25 }}>
          <Typography component="span" variant="h6">Plano de referencia</Typography>
          <Tooltip title="Cerrar vista ampliada"><IconButton aria-label="Cerrar vista ampliada" onClick={closeExpanded}><CloseRoundedIcon /></IconButton></Tooltip>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: 'grey.900', p: { xs: 1, md: 2 }, overflow: 'auto' }} onWheel={handleWheel}>
          <Box sx={{ minWidth: scale > 1 ? `${scale * 100}%` : '100%', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {imageAvailable ? (
              <Box component="img" src={imageUrl} alt="Plano de referencia ampliado" sx={{ display: 'block', width: `${scale * 100}%`, maxWidth: 'none', height: 'auto', objectFit: 'contain', transition: 'width 120ms ease' }} />
            ) : (
              <Typography color="common.white">No se pudo cargar el plano de referencia.</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 0.5, flexWrap: 'wrap' }}>
          <Tooltip title="Alejar"><IconButton aria-label="Alejar plano" onClick={() => updateZoom(-0.25)} disabled={scale <= 1}><ZoomOutRoundedIcon /></IconButton></Tooltip>
          <Typography variant="body2" sx={{ minWidth: 56, textAlign: 'center' }}>{Math.round(scale * 100)}%</Typography>
          <Tooltip title="Acercar"><IconButton aria-label="Acercar plano" onClick={() => updateZoom(0.25)} disabled={scale >= 3}><ZoomInRoundedIcon /></IconButton></Tooltip>
          <Tooltip title="Restablecer vista"><span><IconButton aria-label="Restablecer vista" onClick={() => setScale(1)} disabled={scale === 1}><RestartAltRoundedIcon /></IconButton></span></Tooltip>
        </DialogActions>
      </Dialog>
    </PageContainer>
  )
}
