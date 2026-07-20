import { alpha, type CSSObject, type Theme } from '@mui/material/styles'

import { BASE_INPUT_FONT_SIZE } from '../components/ui/inputs/BaseTextInput/BaseTextInput.component'

const OUTLINED_INPUT_BORDER_WIDTH = 1

const OUTLINED_INPUT_BORDER_OPACITY = {
  default: 0.23,
  focus: 0.55,
} as const

const INTER_FONT_FAMILY = '"Inter var", "Inter", sans-serif'

function getOutlinedInputBorderColor(theme: Theme, opacity: number): string {
  return alpha(theme.palette.text.primary, opacity)
}

const PAPER_POPOVER_PADDING = '0.8rem 1rem'

const paperPopoverSurfaceSx = {
  bgcolor: 'background.paper',
  color: 'text.primary',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '1rem',
  fontSize: '1.2rem',
  lineHeight: 1.45,
  backgroundImage: 'none',
} as const

function getPaperPopoverShadow(theme: Theme): string {
  return `0 0 0 8px ${theme.palette.background.paper}`
}

function getPaperPopoverSurfaceStyles(theme: Theme): CSSObject {
  return {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '1rem',
    fontSize: '1.2rem',
    lineHeight: 1.45,
    boxShadow: getPaperPopoverShadow(theme),
    backgroundImage: 'none',
  }
}

export const commonComponents = {
  MuiCssBaseline: {
    styleOverrides: {
      '@global': {
        html: {
          fontFamily: INTER_FONT_FAMILY,
        },
        body: {
          fontFamily: INTER_FONT_FAMILY,
        },
        '@supports (font-variation-settings: normal)': {
          html: {
            fontFamily: INTER_FONT_FAMILY,
          },
          body: {
            fontFamily: INTER_FONT_FAMILY,
          },
        },
      },
    },
  },
  MuiFormControlLabel: {
    styleOverrides: {
      label: {
        fontSize: BASE_INPUT_FONT_SIZE,
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      input: {
        fontSize: BASE_INPUT_FONT_SIZE,

        '&::placeholder': {
          fontSize: BASE_INPUT_FONT_SIZE,
        },
      },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        fontSize: BASE_INPUT_FONT_SIZE,
      },
    },
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: {
        fontSize: '1.2rem',
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      notchedOutline: ({ theme }: { theme: Theme }) => ({
        borderWidth: OUTLINED_INPUT_BORDER_WIDTH,
        borderColor: getOutlinedInputBorderColor(theme, OUTLINED_INPUT_BORDER_OPACITY.default),
      }),
      root: ({ theme }: { theme: Theme }) => ({
        '&:hover:not(.Mui-disabled):not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
          borderWidth: OUTLINED_INPUT_BORDER_WIDTH,
          borderColor: getOutlinedInputBorderColor(theme, OUTLINED_INPUT_BORDER_OPACITY.default),
        },
        '&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
          borderWidth: OUTLINED_INPUT_BORDER_WIDTH,
          borderColor: getOutlinedInputBorderColor(theme, OUTLINED_INPUT_BORDER_OPACITY.focus),
        },
        '&.Mui-focused.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderWidth: OUTLINED_INPUT_BORDER_WIDTH,
        },
      }),
    },
  },
  MuiTooltip: {
    defaultProps: {
      TransitionProps: { timeout: 0 },
    },
    styleOverrides: {
      tooltip: ({ theme }: { theme: Theme }) => ({
        ...getPaperPopoverSurfaceStyles(theme),
        padding: PAPER_POPOVER_PADDING,
      }),
      arrow: ({ theme }: { theme: Theme }) => ({
        color: theme.palette.background.paper,
        '&::before': {
          border: `1px solid ${theme.palette.divider}`,
        },
      }),
    },
  },
  MuiSnackbar: {
    defaultProps: {
      TransitionProps: { timeout: 0 },
      ContentProps: {
        elevation: 0,
        sx: (theme: Theme) => ({
          ...paperPopoverSurfaceSx,
          p: PAPER_POPOVER_PADDING,
          boxShadow: getPaperPopoverShadow(theme),
        }),
      },
    },
  },
  MuiSnackbarContent: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        ...getPaperPopoverSurfaceStyles(theme),
        padding: PAPER_POPOVER_PADDING,
      }),
      message: {
        padding: 0,
      },
      action: {
        paddingLeft: 8,
        marginRight: 0,
      },
    },
  },
}
