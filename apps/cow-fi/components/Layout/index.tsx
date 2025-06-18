'use client'

import { PropsWithChildren, ReactNode } from 'react'

import { Footer, GlobalCoWDAOStyles, Media, MenuBar } from '@cowprotocol/ui'
import { baseTheme } from '@cowprotocol/ui'

import Link from 'next/link'
import styled, { createGlobalStyle, css, ThemeProvider } from 'styled-components/macro'

import { NAV_ADDITIONAL_BUTTONS, NAV_ITEMS, PAGE_MAX_WIDTH, PRODUCT_VARIANT } from './const'

import { useSetupPage } from '../../hooks/useSetupPage'

const darkTheme = baseTheme('dark')

const LinkComponent = (props: PropsWithChildren<{ href: string }>) => {
  const external = props.href.startsWith('http')

  return <Link {...props} target={external ? '_blank' : '_self'} rel={external ? 'noopener noreferrer' : undefined} />
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 60vh;
  max-width: ${PAGE_MAX_WIDTH}px;
  margin: 0 auto;
  padding: 0 60px;

  ${Media.upToLarge()} {
    padding: 0;
  }
`

interface LayoutProps {
  children: ReactNode
  bgColor?: string
  host?: string
}

export function Layout({ children, bgColor, host }: Readonly<LayoutProps>): ReactNode {
  useSetupPage()

  const GlobalStyles = GlobalCoWDAOStyles()
  const LocalStyles = createGlobalStyle(
    () => css`
      body {
        background: ${bgColor};
      }
    `,
  )

  return (
    <>
      <GlobalStyles />
      <LocalStyles />
      {/* Override global light theme to force dark mode for MenuBar only */}
      <ThemeProvider theme={darkTheme}>
        <MenuBar
          navItems={NAV_ITEMS}
          productVariant={PRODUCT_VARIANT}
          additionalNavButtons={NAV_ADDITIONAL_BUTTONS}
          padding="10px 60px"
          maxWidth={PAGE_MAX_WIDTH}
          LinkComponent={LinkComponent}
        />
      </ThemeProvider>
      <Wrapper>{children}</Wrapper>
      {/* Override global light theme to force dark mode for Footer only */}
      <ThemeProvider theme={darkTheme}>
        <Footer
          maxWidth={PAGE_MAX_WIDTH}
          productVariant={PRODUCT_VARIANT}
          host={host ?? process.env.NEXT_PUBLIC_SITE_URL!}
          expanded
          hasTouchFooter
        />
      </ThemeProvider>
    </>
  )
}
