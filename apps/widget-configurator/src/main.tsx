import { StrictMode, useMemo } from 'react'

import { CssBaseline, GlobalStyles } from '@mui/material'
import { createTheme, PaletteOptions, ThemeProvider } from '@mui/material/styles'
import { createRoot } from 'react-dom/client'

import App from './app/app'
import { ColorModeContext, globalStyles } from './theme/ColorModeContext'
import { commonTypography } from './theme/commonTypography'
import { useColorMode } from './theme/hooks/useColorMode'
import { darkPalette, lightPalette } from './theme/paletteOptions'

function Root() {
  const colorMode = useColorMode()
  const { mode } = colorMode

  const theme = useMemo(() => {
    const palette: PaletteOptions = mode === 'dark' ? darkPalette : lightPalette

    return createTheme({
      palette,
      typography: commonTypography,
    })
  }, [mode])

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles styles={globalStyles(theme, colorMode.mode)} />
        <App />
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

const root = createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <StrictMode>
    <Root />
  </StrictMode>
)
