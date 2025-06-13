import { StrictMode, useMemo } from 'react'

import { CowAnalyticsProvider, initGtm } from '@cowprotocol/analytics'

import { CssBaseline, GlobalStyles } from '@mui/material'
import Box from '@mui/material/Box'
import { createTheme, PaletteOptions, ThemeProvider } from '@mui/material/styles'
import 'inter-ui'
import { createRoot } from 'react-dom/client'

import { Configurator } from './app/configurator'
import { ColorModeContext, globalStyles } from './theme/ColorModeContext'
import { commonTypography } from './theme/commonTypography'
import { useColorMode } from './theme/hooks/useColorMode'
import { darkPalette, lightPalette } from './theme/paletteOptions'
import { initWeb3Modal } from './web3modalConfig'
import { WithLDProvider } from './WithLDProvider'

// Initialize analytics instance
export const cowAnalytics = initGtm()

const WrapperStyled = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
}

initWeb3Modal()

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function Root() {
  const colorMode = useColorMode()
  const { mode } = colorMode

  const theme = useMemo(() => {
    const palette: PaletteOptions = mode === 'dark' ? darkPalette : lightPalette

    return createTheme({
      palette,
      typography: commonTypography,
      components: {
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
