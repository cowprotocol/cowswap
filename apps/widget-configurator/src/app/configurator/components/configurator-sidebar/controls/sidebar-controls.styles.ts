import { SxProps } from '@mui/material'
import { Theme } from '@mui/material/styles'

export const sidebarControlsZeroWidthColumnSx: SxProps<Theme> = {
  position: 'relative',
  width: 0,
  height: '100%',
  flexShrink: 0,
}

export const sidebarToggleOpenButton: SxProps<Theme> = (theme: Theme) => ({
  position: 'fixed',
  top: '1.6rem',
  left: '1.6rem',

  width: '3.6rem',
  height: '3.6rem',
  borderRadius: '50%',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.primary.main,
  boxShadow: 'none',
  zIndex: 3,

  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    boxShadow: 'none',
  },
})

export const sidebarResizeHandle: SxProps<Theme> = {
  position: 'absolute',
  inset: 0,
  width: '0.8rem',
  marginLeft: '-0.4rem',
  cursor: 'col-resize',
  zIndex: 2,

  '&::before': {
    content: '""',
    position: 'absolute',
    top: '1.6rem',
    bottom: '1.6rem',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '0.2rem',
    borderRadius: '999px',
    backgroundColor: 'divider',
  },

  '&:hover::before': {
    backgroundColor: 'text.secondary',
  },
}
