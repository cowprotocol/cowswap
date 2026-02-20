import { ReactNode, StrictMode, useMemo } from 'react'

import { CowAnalyticsProvider, initGtm } from '@cowprotocol/analytics'

import { CssBaseline, GlobalStyles } from '@mui/material'
import Box from '@mui/material/Box'
import { createTheme, PaletteOptions, ThemeProvider } from '@mui/material/styles'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import 'inter-ui'
import { createRoot } from 'react-dom/client'
import { WagmiProvider } from 'wagmi'

import { Configurator } from './app/configurator'
import { ColorModeContext, globalStyles } from './theme/ColorModeContext'
import { commonTypography } from './theme/commonTypography'
import { useColorMode } from './theme/hooks/useColorMode'
import { darkPalette, lightPalette } from './theme/paletteOptions'
import { initAppKit, wagmiConfig } from './web3modalConfig'
import { WithLDProvider } from './WithLDProvider'

// Initialize analytics instance
export const cowAnalytics = initGtm()

const WrapperStyled = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
}

const queryClient = new QueryClient()

initAppKit()

function Root(): ReactNode {
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
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
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
