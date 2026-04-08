import type { Theme } from '@mui/material/styles'

export const DRAWER_TRANSITION = 'width 225ms cubic-bezier(0, 0, 0.2, 1)'

export const DRAWER_WIDTH_CSS_VAR = '--widget-configurator-drawer-width'

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
    overflowY: 'scroll',
  },
})

export const WalletConnectionWrapper = {
  display: 'flex',
  justifyContent: 'center',
  margin: '0 auto 1rem',
  width: '100%',
}
