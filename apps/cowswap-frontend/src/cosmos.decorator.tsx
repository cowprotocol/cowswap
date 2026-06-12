import '@reach/dialog/styles.css'
import './polyfills'

import { PropsWithChildren, ReactNode, StrictMode, useCallback, useContext } from 'react'

import { CowAnalyticsProvider, initGtm } from '@cowprotocol/analytics'
import svgMoonSrc from '@cowprotocol/assets/cow-swap/moon.svg'
import svgSunSrc from '@cowprotocol/assets/cow-swap/sun.svg'
import { WalletUpdater, Web3Provider } from '@cowprotocol/wallet'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LanguageProvider } from 'i18n'
import SVG from 'react-inlinesvg'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router'
import { Flex } from 'rebass'
import styled, { ThemeContext } from 'styled-components/macro'
import { ThemedGlobalStyle, ThemeProvider, WIDGET_MAX_WIDTH } from 'theme'

import { cowSwapStore } from 'legacy/state'
import { useDarkModeManager } from 'legacy/state/user/hooks'

import { BlockNumberProvider } from './common/hooks/useBlockNumber'
import { ThemeConfigUpdater } from './theme/ThemeConfigUpdater'

/** No locale import in Cosmos: .po needs Lingui transform, .js is CJS and breaks in the iframe. Fixtures still render; some text may show as message IDs. */
const COSMOS_MESSAGES = undefined

const DarkModeToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 10;
  padding: 6px 10px;
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const DarkModeToggle = ({ children }: { children?: ReactNode }) => {
  const theme = useContext(ThemeContext)
  const [darkMode, toggleDarkModeAux] = useDarkModeManager()
  const toggleDarkMode = useCallback(() => {
    toggleDarkModeAux()
  }, [toggleDarkModeAux])
  const label = (darkMode ? 'Light' : 'Dark') + ' Mode'
  const description = `${darkMode ? 'Sun/light' : 'Moon/dark'} mode icon`

  return (
    <ThemeContext.Provider value={theme}>
      <DarkModeToggleButton onClick={toggleDarkMode}>
        <SVG src={darkMode ? svgSunSrc : svgMoonSrc} description={description} /> {label}
      </DarkModeToggleButton>

      {children}
    </ThemeContext.Provider>
  )
}

const Wrapper = styled(Flex)`
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
`

const WrapperInner = styled.div`
  margin: auto;
  width: 100%;
  height: auto;
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  padding-top: 48px;
`

export const DemoContainer = styled.div`
  width: 100%;
  max-width: ${WIDGET_MAX_WIDTH.swap};
  margin: 0 auto;
  display: flex;
  flex-flow: column wrap;
  gap: 6px;
  background: ${({ theme }) => theme.paper};
  border: none;
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.boxShadow1};
  padding: 10px;
`

// Initialize analytics for cosmos
const cowAnalytics = initGtm()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
    },
  },
})

function Fixture({ children }: PropsWithChildren): ReactNode {
  return (
    <StrictMode>
      <Provider store={cowSwapStore}>
        <QueryClientProvider client={queryClient}>
          <HashRouter>
            <ThemeProvider>
              <ThemedGlobalStyle />
              <LanguageProvider messages={COSMOS_MESSAGES}>
                <Web3Provider>
                  <BlockNumberProvider>
                    <WalletUpdater />
                    <ThemeConfigUpdater />
                    <Wrapper>
                      <CowAnalyticsProvider cowAnalytics={cowAnalytics}>
                        <DarkModeToggle>
                          <WrapperInner>{children}</WrapperInner>
                        </DarkModeToggle>
                      </CowAnalyticsProvider>
                    </Wrapper>
                  </BlockNumberProvider>
                </Web3Provider>
              </LanguageProvider>
            </ThemeProvider>
          </HashRouter>
        </QueryClientProvider>
      </Provider>
    </StrictMode>
  )
}

export default Fixture
