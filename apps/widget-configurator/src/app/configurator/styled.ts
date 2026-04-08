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

export const configuratorCheckeredCanvasSx: SxProps<Theme> = (theme) => {
  const isDark = theme.palette.mode === 'dark'
  const squareA = theme.palette.grey[isDark ? 900 : 200]
  const squareB = theme.palette.grey[isDark ? 800 : 300]
  const base = theme.palette.grey[isDark ? 900 : 200]
  const pattern = `repeating-conic-gradient(from 90deg, ${squareA} 0% 25%, ${squareB} 0% 50%)`

  return {
    width: 0,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexFlow: 'column',
    flex: '1 1 auto',
    minWidth: 0,
    overflow: 'auto',
    padding: `${CONTENT_PADDING_PX}px`,
    backgroundColor: base,

    '& > div': {
      backgroundImage: `${pattern}`,
      backgroundSize: `${TRANSPARENCY_CHECKER_PX}px ${TRANSPARENCY_CHECKER_PX}px`,
      backgroundRepeat: 'repeat',
      backgroundPosition: `right ${CONTENT_PADDING_PX}px top ${CONTENT_PADDING_PX}px`,
      backgroundClip: 'content-box',
      backgroundOrigin: 'content-box',
    },

    '& > div > iframe': {
      display: 'block',
      border: 0,
      margin: '0 auto',
      outline: '1px dashed cyan',
      //overflow: 'auto',
    },
  }
}
