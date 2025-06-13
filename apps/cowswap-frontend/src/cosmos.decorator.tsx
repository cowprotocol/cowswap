import '@reach/dialog/styles.css'
import './polyfills'

import { ReactNode, StrictMode, useCallback, useContext } from 'react'

import { CowAnalyticsProvider, initGtm } from '@cowprotocol/analytics'
import IMAGE_MOON from '@cowprotocol/assets/cow-swap/moon.svg'
import IMAGE_SUN from '@cowprotocol/assets/cow-swap/sun.svg'
import { injectedWalletConnection, WalletUpdater } from '@cowprotocol/wallet'
import { Web3ReactProvider } from '@web3-react/core'

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
        <SVG src={darkMode ? IMAGE_SUN : IMAGE_MOON} description={description} /> {label}
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

const chainId = 5

const { connector, hooks } = injectedWalletConnection
connector.activate(chainId)

// Initialize analytics for cosmos
const cowAnalytics = initGtm()

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const Fixture = ({ children }: { children: ReactNode }) => {
  return (
    <StrictMode>
      <Provider store={cowSwapStore}>
        <HashRouter>
          <ThemeProvider>
            <ThemedGlobalStyle />
            <LanguageProvider>
              <Web3ReactProvider connectors={[[connector, hooks]]} network={chainId}>
                <BlockNumberProvider>
                  <WalletUpdater />
                  <Wrapper>
                    <CowAnalyticsProvider cowAnalytics={cowAnalytics}>
                      <DarkModeToggle>
                        <WrapperInner>{children}</WrapperInner>
                      </DarkModeToggle>
                    </CowAnalyticsProvider>
                  </Wrapper>
                </BlockNumberProvider>
              </Web3ReactProvider>
            </LanguageProvider>
          </ThemeProvider>
        </HashRouter>
      </Provider>
    </StrictMode>
  )
}

export default Fixture
