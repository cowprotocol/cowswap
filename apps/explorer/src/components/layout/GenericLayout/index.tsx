import { PropsWithChildren } from 'react'

import { ThemeProvider, StaticGlobalStyle, ThemedGlobalStyle } from 'theme'

import { Footer } from './Footer'
import { Header } from './Header'

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
      {header}
      {children}
      {footer}
    </ThemeProvider>
  </>
)

export default GenericLayout
