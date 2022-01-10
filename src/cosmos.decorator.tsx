import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { Flex } from 'rebass'
import store from 'state'
import styled from 'styled-components/macro'
import ThemeProvider from 'theme'
import { LanguageProvider } from 'i18n'

const Wrapper = styled(Flex)`
  padding: 1.2rem 0.6rem;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 20px);
  background-color: #e3e3e3;
`

const Fixture = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <LanguageProvider>
          <Wrapper>{children}</Wrapper>
        </LanguageProvider>
      </ThemeProvider>
    </Provider>
  )
}

export default Fixture
