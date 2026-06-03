import { alpha, type Theme } from '@mui/material/styles'

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
}
