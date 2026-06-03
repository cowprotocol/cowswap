import { ReactNode, StrictMode, useMemo } from 'react'

import { CowAnalyticsProvider, initGtm } from '@cowprotocol/analytics'
import FONT_STUDIO_FEIXEN_BOLD from '@cowprotocol/assets/fonts/StudioFeixenSans-Bold.woff2'

import { CssBaseline, GlobalStyles } from '@mui/material'
import Box from '@mui/material/Box'
import { createTheme, PaletteOptions, ThemeProvider, alpha, type Theme } from '@mui/material/styles'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import 'inter-ui'
import { createRoot } from 'react-dom/client'
import { WagmiProvider } from 'wagmi'

import { Configurator } from './components/configurator/configurator.component'
import { BASE_INPUT_FONT_SIZE } from './components/ui/inputs/BaseTextInput/BaseTextInput.component'
import { ColorModeContext, globalStyles } from './theme/ColorModeContext'
import { commonTypography } from './theme/commonTypography'
import { useColorMode } from './theme/hooks/useColorMode'
import { darkPalette, lightPalette } from './theme/paletteOptions'
// Importing for side effects: createAppKit() runs at module load.
import { wagmiConfig } from './wagmiConfig'
import { WithLDProvider } from './WithLDProvider'

// Initialize analytics instance
const cowAnalytics = initGtm()

const feixenFontStyles = {
  '@font-face': {
    fontFamily: 'studiofeixen',
    src: `url(${FONT_STUDIO_FEIXEN_BOLD}) format('woff2')`,
    fontStyle: 'normal',
    fontWeight: 700,
    fontDisplay: 'swap',
  },
}

const OUTLINED_INPUT_BORDER_WIDTH = 1

const OUTLINED_INPUT_BORDER_OPACITY = {
  default: 0.23,
  focus: 0.55,
} as const

function getOutlinedInputBorderColor(theme: Theme, opacity: number): string {
  return alpha(theme.palette.text.primary, opacity)
}

const configuratorControlStyles = {
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

const queryClient = new QueryClient()

const WrapperStyled = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
}

function Root(): ReactNode {
  const colorMode = useColorMode()
  const { mode } = colorMode

  const theme = useMemo(() => {
    const palette: PaletteOptions = mode === 'dark' ? darkPalette : lightPalette

    return createTheme({
      palette,
      typography: commonTypography,
      components: {
        ...configuratorControlStyles,
        MuiCssBaseline: {
          styleOverrides: {
            '@global': {
              html: {
                fontFamily: '"Inter var", "Inter", sans-serif',
              },
              body: {
                fontFamily: '"Inter var", "Inter", sans-serif',
              },
              '@supports (font-variation-settings: normal)': {
                html: {
                  fontFamily: '"Inter var", "Inter", sans-serif',
                },
                body: {
                  fontFamily: '"Inter var", "Inter", sans-serif',
                },
              },
            },
          },
        },
      },
    })
  }, [mode])

  return (
    <StrictMode>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <GlobalStyles styles={feixenFontStyles} />
              <GlobalStyles styles={globalStyles(theme)} />
              <Box sx={WrapperStyled}>
                <WithLDProvider>
                  <CowAnalyticsProvider cowAnalytics={cowAnalytics}>
                    <Configurator title="CoW Widget" />
                  </CowAnalyticsProvider>
                </WithLDProvider>
              </Box>
            </ThemeProvider>
          </ColorModeContext.Provider>
        </QueryClientProvider>
      </WagmiProvider>
    </StrictMode>
  )
}

const root = createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
