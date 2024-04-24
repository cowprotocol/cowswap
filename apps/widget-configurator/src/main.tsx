import { StrictMode, useMemo } from 'react'

import { CssBaseline, GlobalStyles } from '@mui/material'
import 'inter-ui'
import Box from '@mui/material/Box'
import { createTheme, PaletteOptions, ThemeProvider } from '@mui/material/styles'
import { createRoot } from 'react-dom/client'

import { Configurator } from './app/configurator'
import { ColorModeContext, globalStyles } from './theme/ColorModeContext'
import { commonTypography } from './theme/commonTypography'
import { useColorMode } from './theme/hooks/useColorMode'
import { darkPalette, lightPalette } from './theme/paletteOptions'
import { initWeb3Modal } from './web3modalConfig'

const WrapperStyled = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
}

initWeb3Modal()

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
            <Configurator title="CoW Widget" />
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
  </StrictMode>
)
