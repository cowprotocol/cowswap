import { darken, lighten } from '@mui/material/styles'

import type { SxProps, Theme } from '@mui/material/styles'

export const configuradorRootSx: SxProps<Theme> = {
  display: 'flex',
  flexFlow: 'row nowrap',
  width: '100%',
  height: '100vh',
  overflowX: 'hidden',
}

const TRANSPARENCY_CHECKER_PX = 8
const CONTENT_PADDING_PX = 16

/** Stable preview host for layout/checkered styles (npm widget-react omits `#cowswap-widget`). */
export const COW_CONFIGURATOR_PREVIEW_HOST_ATTR = 'data-cow-configurator-preview-host'

export const configuratorCheckeredCanvasSx =
  (isWidgetReady: boolean, showIframeOutline: boolean, blockScroll = false): SxProps<Theme> =>
  (theme) => {
    const paper = theme.palette.background.paper
    const isDark = theme.palette.mode === 'dark'
    const squareA = isDark ? lighten(paper, 0.06) : paper
    const squareB = isDark ? paper : darken(paper, 0.11)
    const base = paper
    const pattern = `repeating-conic-gradient(from 90deg, ${squareA} 0% 25%, ${squareB} 0% 50%)`

    return {
      position: 'relative',
      flex: '1 1 auto',
      overflowY: blockScroll ? 'hidden' : 'scroll',
      padding: `${CONTENT_PADDING_PX}px`,
      backgroundColor: base,

      [`& > [${COW_CONFIGURATOR_PREVIEW_HOST_ATTR}]`]: {
        minWidth: '100%',
        minHeight: '100%',
        flex: '1 1 auto',
        backgroundImage: `${pattern}`,
        backgroundSize: `${TRANSPARENCY_CHECKER_PX}px ${TRANSPARENCY_CHECKER_PX}px`,
        backgroundRepeat: 'repeat',
        backgroundPosition: `right ${CONTENT_PADDING_PX}px top ${CONTENT_PADDING_PX}px`,
        backgroundClip: 'content-box',
        backgroundOrigin: 'content-box',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',

        '& #cowswap-iframe, & iframe': {
          display: 'block',
          border: 0,
          margin: '0 auto',
          outline: showIframeOutline ? '1px dashed cyan' : 'none',
          transition: 'opacity 0.3s ease-in-out',
          opacity: isWidgetReady ? 1 : 0,
          pointerEvents: isWidgetReady ? 'auto' : 'none',
        },
      },
    }
  }
