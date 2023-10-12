import * as React from 'react'
import { StrictMode } from 'react'
import { ThemeProvider, createTheme, PaletteOptions } from '@mui/material/styles'
import { CssBaseline, GlobalStyles, PaletteMode } from '@mui/material'
import * as ReactDOM from 'react-dom/client'
import App from './app/app'
import useMediaQuery from '@mui/material/useMediaQuery'

export const ColorModeContext = React.createContext({
  mode: 'light' as PaletteMode,
  toggleColorMode: () => {},
  setAutoMode: () => {}
});

const globalStyles = {
  'html, input, textarea, button': {
    fontFamily: "'Inter', sans-serif",
    fontDisplay: 'fallback',
  },
  '@supports (font-variation-settings: normal)': {
    'html, input, textarea, button': {
      fontFamily: "'Inter var', sans-serif",
    },
  },
  'html, body, a, button': {
    margin: 0,
    padding: 0,
  },
  'html, body, #root': {
    height: '100%',
    width: '100%',
  },
  html: {
    width: '100%',
    margin: 0,
    fontSize: '62.5%',
    textRendering: 'geometricPrecision',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    boxSizing: 'border-box',
    overscrollBehaviorY: 'none',
    scrollBehavior: 'smooth',
    fontVariant: 'none',
    fontFeatureSettings: "'ss01' on, 'ss02' on, 'cv01' on, 'cv03' on",
    WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
    background: 'linear-gradient(45deg,#EAE9FF 14.64%,#CAE9FF 85.36%)',
    backgroundAttachment: 'fixed',
  },
}

export enum ThemeMode {
  Auto = 1,
  Light = 2,
  Dark = 3,
}

function MainApp() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = React.useState<PaletteMode>(prefersDarkMode ? 'dark' : 'light');

  const colorMode = React.useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
      },
      setAutoMode: () => {
        setMode(prefersDarkMode ? 'dark' : 'light');
      },
    }),
    [mode, prefersDarkMode]
  );

  const theme = React.useMemo(() => {
    const commonTypography = {
      htmlFontSize: 10,
      button: {
        textTransform: 'none' as const,
      },
    }

    const palette: PaletteOptions =
      mode === 'dark'
        ? {
            mode: 'dark' as PaletteMode,
            tonalOffset: 0.2,
            primary: {
              main: 'rgb(202, 233, 255)',
            },
            secondary: {
              main: 'rgb(39, 120, 242)',
            },
            text: {
              primary: '#CAE9FF',
              secondary: '#809ab1',
              disabled: 'rgba(202,233,255,0.6)',
            },
            background: {
              paper: 'rgb(12, 38, 75)',
              default: 'rgb(12, 38, 75)',
            },
            cow: {
              background: 'radial-gradient(50% 500px at 50% -6%, rgba(0, 41, 102, 0.7) 0%, rgb(7, 24, 50) 50%, rgb(6, 22, 45) 100%), radial-gradient(circle at -70% 50%, rgba(0, 43, 102, 0.7) 0px, transparent 50%) fixed'
            }
          }
        : {
            mode: 'light' as PaletteMode,
            tonalOffset: 0.5,
            primary: {
              main: 'rgb(5, 43, 101)',
            },
            secondary: {
              main: 'rgb(39, 120, 242)',
            },
            text: {
              primary: 'rgb(12, 38, 75)',
            },
            background: {
              default: '#CAE9FF',
              paper: '#ffffff',
            },
            cow: {
              background: 'linear-gradient(45deg, rgb(234, 233, 255) 14.64%, rgb(202, 233, 255) 85.36%) fixed'
            }
          }

    return createTheme({
      palette,
      typography: commonTypography,
    })
  }, [mode])

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles styles={globalStyles} />
        <App />
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <StrictMode>
    <MainApp />
  </StrictMode>
)
