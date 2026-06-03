import { ReactNode, StrictMode, useMemo } from 'react'

import { CowAnalyticsProvider, initGtm } from '@cowprotocol/analytics'

import { CssBaseline, GlobalStyles } from '@mui/material'
import Box from '@mui/material/Box'
import { createTheme, PaletteOptions, ThemeProvider } from '@mui/material/styles'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import 'inter-ui'
import { createRoot } from 'react-dom/client'
import { WagmiProvider } from 'wagmi'

import { Configurator } from './components/configurator/configurator.component'
import { commonComponents } from './theme/commonComponents.constants'
import { commonTypography } from './theme/commonTypography.constants'
import { ColorModeProvider } from './theme/context/ColorModeProvider'
import { useColorMode } from './theme/context/hooks/useColorMode'
import { globalStyles } from './theme/globalStyles.constants'
import { darkPalette, lightPalette } from './theme/palettes.constants'
// Importing for side effects: createAppKit() runs at module load.
import { wagmiConfig } from './wagmiConfig'
import { WithLDProvider } from './WithLDProvider'

const cowAnalytics = initGtm()

const queryClient = new QueryClient()

const WrapperStyled = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
}

function ConfiguratorApp(): ReactNode {
  const { mode } = useColorMode()

  const theme = useMemo(() => {
    const palette: PaletteOptions = mode === 'dark' ? darkPalette : lightPalette

    return createTheme({
      palette,
      typography: commonTypography,
      components: commonComponents,
    })
  }, [mode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={globalStyles(theme)} />
      <Box sx={WrapperStyled}>
        <WithLDProvider>
          <CowAnalyticsProvider cowAnalytics={cowAnalytics}>
            <Configurator title="CoW Widget" />
          </CowAnalyticsProvider>
        </WithLDProvider>
      </Box>
    </ThemeProvider>
  )
}

function Root(): ReactNode {
  return (
    <StrictMode>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ColorModeProvider>
            <ConfiguratorApp />
          </ColorModeProvider>
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
