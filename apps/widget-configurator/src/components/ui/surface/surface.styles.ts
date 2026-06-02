import type { SxProps, Theme } from '@mui/material/styles'

/** Shared paper surface for configurator dialogs and other elevated panels. */
export const configuratorSurfacePaperSx: SxProps<Theme> = {
  backgroundColor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: 'none',
  backgroundImage: 'none',
}

/** Select and menu dropdown paper. Extends {@link configuratorSurfacePaperSx} with menu item interaction styles. */
export const configuratorMenuPaperSx: SxProps<Theme> = {
  ...configuratorSurfacePaperSx,
  '& .MuiMenuItem-root': {
    backgroundColor: 'transparent !important',
  },
  '& .MuiMenuItem-root.Mui-selected, & .MuiMenuItem-root.Mui-selected.Mui-focusVisible': {
    backgroundColor: 'transparent !important',
  },
  '& .MuiMenuItem-root.Mui-focusVisible': {
    backgroundColor: 'transparent !important',
  },
  '& .MuiMenuItem-root:hover, & .MuiMenuItem-root.Mui-selected:hover, & .MuiMenuItem-root.Mui-focusVisible:hover, & .MuiMenuItem-root.Mui-selected.Mui-focusVisible:hover':
    (theme) => ({
      backgroundColor: `${theme.palette.action.hover} !important`,
    }),
}
