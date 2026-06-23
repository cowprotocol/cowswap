import type { SxProps, Theme } from '@mui/material/styles'

export const modalTabsSx: SxProps<Theme> = {
  minHeight: 48,

  '& .MuiTab-root': {
    minWidth: 'unset',
    minHeight: 48,
    px: 1.5,
    py: 1.5,
  },

  '& .MuiTab-iconWrapper': {
    height: '16px',
    width: '16px',
    opacity: 0.75,

    '& svg': {
      display: 'block',
      height: '16px',
      width: '16px',
    },
  },

  '& .Mui-selected .MuiTab-iconWrapper': {
    opacity: 1,
  },
}
