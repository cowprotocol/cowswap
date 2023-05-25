import '@reach/dialog/styles.css'

import React, { StrictMode, useCallback, useContext, ReactNode } from 'react'
import { Provider } from 'react-redux'
import { Flex } from 'rebass'
import store from 'legacy/state'
import styled from 'styled-components/macro'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from 'legacy/theme'
import { LanguageProvider } from 'i18n'
import { HashRouter } from 'react-router-dom'
import { Web3ReactProvider } from '@web3-react/core'
import { BlockNumberProvider } from 'lib/hooks/useBlockNumber'
import { injectedConnection } from 'modules/wallet/web3-react/connection/injected'
import { ThemeContext } from 'styled-components/macro'
import { useDarkModeManager } from 'legacy/state/user/hooks'
import SVG from 'react-inlinesvg'
import IMAGE_MOON from 'legacy/assets/cow-swap/moon.svg'
import IMAGE_SUN from 'legacy/assets/cow-swap/sun.svg'

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

const DarkModeToggle = ({ children }: { children?: ReactNode }) => {
  const theme = useContext(ThemeContext)
  const [darkMode, toggleDarkModeAux] = useDarkModeManager()
  const toggleDarkMode = useCallback(() => {
    toggleDarkModeAux()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleDarkModeAux, darkMode])
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
  font-family: 'Inter var', sans-serif;
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
  max-width: ${({ theme }) => theme.appBody.maxWidth.swap};
  margin: 0 auto;
  display: flex;
  flex-flow: column wrap;
  gap: 6px;
  background: ${({ theme }) => theme.bg1};
  border: none;
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.boxShadow1};
  padding: 10px;
`

const chainId = 5

const { connector, hooks } = injectedConnection
connector.activate(chainId)

const Fixture = ({ children }: { children: ReactNode }) => {
  return (
    <StrictMode>
      <FixedGlobalStyle />
      <Provider store={store}>
        <HashRouter>
          <ThemeProvider>
            <ThemedGlobalStyle />
            <LanguageProvider>
              <Web3ReactProvider connectors={[[connector, hooks]]} network={chainId}>
                <BlockNumberProvider>
                  <Wrapper>
                    <DarkModeToggle>
                      <WrapperInner>{children}</WrapperInner>
                    </DarkModeToggle>
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
