import { alpha } from '@mui/material/styles'

import type { CSSObject, SxProps, Theme } from '@mui/material/styles'

export const DRAWER_TRANSITION = 'width 225ms cubic-bezier(0, 0, 0.2, 1)'

export const DRAWER_WIDTH_CSS_VAR = '--widget-configurator-drawer-width'

/** Max width of form/header/footer column; extra drawer width shows the patterned filler only. */
export const SIDEBAR_CONTENT_MAX_WIDTH_PX = 600

/** Inset from the drawer outer edge (left and right of the patterned filler). */
export const SIDEBAR_EDGE_INSET_PX = 8

/** Gap between the content column and the patterned filler. */
export const SIDEBAR_PATTERN_GAP_PX = 8

export const drawerPaperRowSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  flex: '1 0 100%',
  boxSizing: 'border-box',
}

export const drawerContentColumnSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  maxWidth: SIDEBAR_CONTENT_MAX_WIDTH_PX,
  flex: `0 1 ${SIDEBAR_CONTENT_MAX_WIDTH_PX}px`,
  minWidth: 0,
  minHeight: 0,
  boxShadow: (theme: Theme) => `0 0 0 1px ${theme.palette.divider}`,
  zIndex: 1,
}

export function getDrawerPatternFillerSx(theme: Theme): CSSObject {
  const stripe = alpha(theme.palette.divider, 0.0625 / 2)

  return {
    flex: '1 1 0',
    minWidth: 0,
    boxSizing: 'border-box',
    alignSelf: 'stretch',
    minHeight: 0,
    backgroundColor: theme.palette.background.paper,
    backgroundImage: `repeating-linear-gradient(-45deg, ${stripe}, ${stripe} 1px, transparent 1px, transparent 8px)`,
    boxShadow: `inset 0 0 0 16px ${theme.palette.background.paper}`,
  }
}

export function getDrawerSx(theme: Theme, isResizing: boolean): CSSObject {
  return {
    width: `var(${DRAWER_WIDTH_CSS_VAR})`,
    flexShrink: 0,
    transition: isResizing ? 'none' : DRAWER_TRANSITION,

    [theme.breakpoints.down('md')]: {
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: theme.zIndex.modal,
    },

    '& .MuiDrawer-paper': {
      width: `var(${DRAWER_WIDTH_CSS_VAR})`,
      boxSizing: 'border-box',
      height: '100%',
      border: 0,
      background: theme.palette.background.paper,
      boxShadow: 'none',
      position: 'relative',
      overflowY: 'scroll',

      [theme.breakpoints.down('md')]: {
        width: '100vw',
        maxWidth: '380px',
      },
    },
  }
}
