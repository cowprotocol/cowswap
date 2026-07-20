import { SxProps } from '@mui/material'
import { Theme } from '@mui/material/styles'

export const sidebarControlsZeroWidthColumnSx: SxProps<Theme> = (theme: Theme) => ({
  position: 'relative',
  width: 0,
  height: '100%',
  flexShrink: 0,

  // Above the preview area and sidebar, below AppKit (`w3m-modal`) and MUI modals:
  zIndex: theme.zIndex.drawer,
})

export const sidebarToggleOpenButton: SxProps<Theme> = (theme: Theme) => ({
  position: 'absolute',
  top: '50%',
  left: 0,
  width: 48,
  height: 48,
  p: 0,
  pl: '24px',
  pr: '4px',
  transform: 'translate(-50%, -50%)',
  borderRadius: '50%',
  border: `none`,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.primary.main,
  boxShadow: 'none',
  zIndex: 3,
  transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',

  '&[aria-hidden="true"]': {
    opacity: 0,
    pointerEvents: 'none',
  },

  '&:hover': {
    boxShadow: 'none',
    transform: 'translate(-50%, -50%) scale(2)',
  },
})

export const sidebarResizeHandle: SxProps<Theme> = (theme: Theme) => ({
  position: 'absolute',
  inset: 0,
  width: '0.8rem',
  marginLeft: '-0.4rem',
  cursor: 'col-resize',
  zIndex: 2,

  [theme.breakpoints.down('md')]: {
    display: 'none',
  },

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 16,
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 4,
    borderRadius: '999px',
    backgroundColor: 'divider',
  },

  '&:hover::before': {
    backgroundColor: 'text.secondary',
  },
})
