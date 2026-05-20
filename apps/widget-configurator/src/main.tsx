import { ReactNode, StrictMode, useMemo } from 'react'

import { CowAnalyticsProvider, initGtm } from '@cowprotocol/analytics'
import FONT_STUDIO_FEIXEN_BOLD from '@cowprotocol/assets/fonts/StudioFeixenSans-Bold.woff2'

import { CssBaseline, GlobalStyles } from '@mui/material'
import Box from '@mui/material/Box'
import { createTheme, PaletteOptions, ThemeProvider } from '@mui/material/styles'
import 'inter-ui'
import { createRoot } from 'react-dom/client'

import { Configurator } from './components/configurator/configurator.component'
import { ColorModeContext, globalStyles } from './theme/ColorModeContext'
import { commonTypography } from './theme/commonTypography'
import { useColorMode } from './theme/hooks/useColorMode'
import { darkPalette, lightPalette } from './theme/paletteOptions'
import { initWeb3Modal } from './web3modalConfig'
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

const configuratorControlStyles = {
  MuiFormControlLabel: {
    styleOverrides: {
      label: {
        fontSize: '1.4rem',
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      input: {
        fontSize: '1.4rem',

        '&::placeholder': {
          fontSize: '1.4rem',
        },
      },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        fontSize: '1.4rem',
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
}

const WrapperStyled = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
}

initWeb3Modal()

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
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalStyles styles={feixenFontStyles} />
          <GlobalStyles styles={globalStyles(theme, colorMode.mode)} />
          <Box sx={WrapperStyled}>
            <WithLDProvider>
              <CowAnalyticsProvider cowAnalytics={cowAnalytics}>
                <Configurator title="CoW Widget" />
              </CowAnalyticsProvider>
            </WithLDProvider>
          </Box>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </StrictMode>
  )
}

const root = createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
