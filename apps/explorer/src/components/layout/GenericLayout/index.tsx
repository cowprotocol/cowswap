import { PropsWithChildren } from 'react'

import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'
import { StaticGlobalStyle, ThemedGlobalStyle, ThemeProvider } from 'theme'

import { Footer } from './Footer'
import { Header } from './Header'

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
`

const MainContent = styled.main`
  flex: 1;
  padding-bottom: 5rem;
  width: 100%;

  ${Media.upToMedium()} {
    padding-bottom: 0;
  }
`

export type Props = PropsWithChildren<{
  header?: React.ReactNode | null
  footer?: React.ReactNode | null
}>

const defaultHeader = <Header />
const defaultFooter = <Footer />

export const GenericLayout: React.FC<Props> = ({ header = defaultHeader, footer = defaultFooter, children }) => (
  <>
    <StaticGlobalStyle />
    <ThemeProvider>
      <ThemedGlobalStyle />
      <PageWrapper>
        {header}
        <MainContent>
          {children}
        </MainContent>
        {footer}
      </PageWrapper>
    </ThemeProvider>
  </>
)

export default GenericLayout
