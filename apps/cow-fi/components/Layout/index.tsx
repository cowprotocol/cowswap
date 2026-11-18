'use client'

import { PropsWithChildren, ReactNode } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { Footer, Media, MenuBar, baseTheme, getGlobalFooterNavItems } from '@cowprotocol/ui'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styled, { createGlobalStyle, css, ThemeProvider } from 'styled-components/macro'

import { getNavAdditionalButtons, getNavItems, PAGE_MAX_WIDTH, PRODUCT_VARIANT } from './const'

import { useSetupPage } from '../../hooks/useSetupPage'
import { CowSaucerScene } from '../CowSaucerScene'

const darkTheme = baseTheme('dark')

const LinkComponent = (props: PropsWithChildren<{ href: string }>): ReactNode => {
  const external = props.href.startsWith('http')

  return <Link {...props} target={external ? '_blank' : '_self'} rel={external ? 'noopener noreferrer' : undefined} />
}

const Wrapper = styled.div<{ minHeight?: string }>`
  display: flex;
  flex-direction: column;
  min-height: ${({ minHeight }) => minHeight ?? '60vh'};
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
  showCowSaucer?: boolean
  contentMinHeight?: string
}

export function Layout({ children, bgColor, host, showCowSaucer, contentMinHeight }: Readonly<LayoutProps>): ReactNode {
  useSetupPage()
  const { isSolversEnabled, isRwaEnabled } = useFeatureFlags()
  const pathname = usePathname()

  const LocalStyles = createGlobalStyle(
    () => css`
      body {
        background: ${bgColor};
      }
    `,
  )

  return (
    <>
      <LocalStyles />
      {/* Override global light theme to force dark mode for MenuBar only */}
      <ThemeProvider theme={darkTheme}>
        <MenuBar
          navItems={getNavItems(!!isSolversEnabled)}
          productVariant={PRODUCT_VARIANT}
          additionalNavButtons={getNavAdditionalButtons(pathname)}
          padding="10px 60px"
          maxWidth={PAGE_MAX_WIDTH}
          LinkComponent={LinkComponent}
          isRwaEnabled={!!isRwaEnabled}
        />
      </ThemeProvider>
      <Wrapper minHeight={contentMinHeight}>{children}</Wrapper>
      {showCowSaucer ? <CowSaucerScene /> : null}
      {/* Override global light theme to force dark mode for Footer only */}
      <ThemeProvider theme={darkTheme}>
        <Footer
          maxWidth={PAGE_MAX_WIDTH}
          productVariant={PRODUCT_VARIANT}
          navItems={getGlobalFooterNavItems(!!isRwaEnabled)}
          host={host ?? process.env.NEXT_PUBLIC_SITE_URL!}
          expanded
          hasTouchFooter
          isRwaEnabled={!!isRwaEnabled}
        />
      </ThemeProvider>
    </>
  )
}
