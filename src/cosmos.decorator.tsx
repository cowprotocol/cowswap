import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { Box, Flex } from 'rebass'
import store from 'state'
import styled from 'styled-components/macro'
import ThemeProvider from 'theme'
import { LanguageProvider } from 'i18n'
import { HashRouter } from 'react-router-dom'
import { Web3ReactProvider } from '@web3-react/core'
import { BlockNumberProvider } from '@src/lib/hooks/useBlockNumber'
import { injectedConnection } from '@cow/modules/wallet/web3-react/connection/injected'

const Wrapper = styled(Flex)`
  font-family: 'Inter var', sans-serif;
  padding: 1.2rem 0.6rem;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 20px);
  background-color: #e3e3e3;
`
const WidthWrapper = styled.div`
  min-width: 420px;
`

const chainId = 5

const { connector, hooks } = injectedConnection
connector.activate(chainId)

const Fixture = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <HashRouter>
        <ThemeProvider>
          <LanguageProvider>
            <Web3ReactProvider connectors={[[connector, hooks]]} network={chainId}>
              <BlockNumberProvider>
                <Wrapper>
                  <WidthWrapper>
                    <Box>{children}</Box>
                  </WidthWrapper>
                </Wrapper>
              </BlockNumberProvider>
            </Web3ReactProvider>
          </LanguageProvider>
        </ThemeProvider>
      </HashRouter>
    </Provider>
  )
}

export default Fixture
