import { Theme } from '@mui/material/styles'

export const DRAWER_WIDTH_CSS_VAR = '--widget-configurator-drawer-width'

export const WrapperStyled = {
  display: 'flex',
  flexFlow: 'row nowrap',
  width: '100%',
  height: '100vh',
  overflowX: 'hidden',
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const DrawerStyled = (theme: Theme) => ({
  width: `var(${DRAWER_WIDTH_CSS_VAR})`,
  flexShrink: 0,

  '& .MuiDrawer-paper': {
    width: `var(${DRAWER_WIDTH_CSS_VAR})`,
    boxSizing: 'border-box',
    display: 'flex',
    flexFlow: 'column',
    gap: '1.6rem',
    height: '100%',
    border: 0,
    background: theme.palette.background.paper,
    boxShadow: 'rgba(5, 43, 101, 0.06) 0 1.2rem 1.2rem',
    padding: '1.6rem',
    position: 'relative',
    overflow: 'hidden',
    overflowY: 'auto',
  },
})

export const ContentStyled = {
  width: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexFlow: 'column',
  flex: '1 1 auto',
  minWidth: 0,
  overflow: 'auto',
  padding: '2rem 1.6rem',

  '& iframe': {
    border: 0,
    margin: '0 auto',
    overflow: 'auto',
  },
}

export const WalletConnectionWrapper = {
  display: 'flex',
  justifyContent: 'center',
  margin: '0 auto 1rem',
  width: '100%',
}

export const ResizeHandleStyled = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  width: '0.8rem',
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

interface DrawerToggleButtonStyles {
  width: string
  height: string
  borderRadius: string
  border: string
  backgroundColor: string
  color: string
  boxShadow: string
  zIndex: number
  '&:hover': {
    backgroundColor: string
    boxShadow: string
  }
}

export const DrawerToggleButtonStyled = (theme: Theme): DrawerToggleButtonStyles => ({
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
