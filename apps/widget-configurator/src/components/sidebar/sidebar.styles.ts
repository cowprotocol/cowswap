import type { CSSObject, Theme } from '@mui/material/styles'

export const DRAWER_TRANSITION = 'width 225ms cubic-bezier(0, 0, 0.2, 1)'

export const DRAWER_WIDTH_CSS_VAR = '--widget-configurator-drawer-width'

export function getDrawerSx(theme: Theme, isResizing: boolean): CSSObject {
  return {
    width: `var(${DRAWER_WIDTH_CSS_VAR})`,
    flexShrink: 0,
    transition: isResizing ? 'none' : DRAWER_TRANSITION,

    '& .MuiDrawer-paper': {
      width: `var(${DRAWER_WIDTH_CSS_VAR})`,
      boxSizing: 'border-box',
      height: '100%',
      border: 0,
      background: theme.palette.background.paper,
      boxShadow: 'none',
      position: 'relative',
      overflowY: 'scroll',
    },
  }
}
