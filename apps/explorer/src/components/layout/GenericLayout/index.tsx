import React, { PropsWithChildren } from 'react'

import ThemeProvider, { StaticGlobalStyle, ThemedGlobalStyle } from 'theme'

import { Footer } from './Footer'
import { Header } from './Header'

export type Props = PropsWithChildren<{
  header?: JSX.Element | null
  footer?: JSX.Element | null
}>

const defaultHeader = <Header />
const defaultFooter = <Footer />

/**
 * Generic layout with optional header and footer
 * Applies global and theme styles to all children
 *
 * If not header/footer set, use default.
 * If a custom passed in will be used instead.
 * To remove header/footer, pass null
 */
export const GenericLayout: React.FC<Props> = ({ header = defaultHeader, footer = defaultFooter, children }) => (
  <div>
    <StaticGlobalStyle />
    <ThemeProvider>
      <ThemedGlobalStyle />
      {header}
      {children}
      {footer}
    </ThemeProvider>
  </div>
)

export default GenericLayout
