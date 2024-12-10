'use client'

import { PropsWithChildren } from 'react'
import Link from 'next/link'
import { Footer, GlobalCoWDAOStyles, Media, MenuBar } from '@cowprotocol/ui'
import styled, { createGlobalStyle, css } from 'styled-components/macro'
import { CoWDAOFonts } from '@/styles/CoWDAOFonts'
import { NAV_ADDITIONAL_BUTTONS, NAV_ITEMS, PAGE_MAX_WIDTH, PRODUCT_VARIANT } from './const'
import { useSetupPage } from '../../hooks/useSetupPage'

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
  children: React.ReactNode
  bgColor?: string
  host?: string
}

export function Layout({ children, bgColor, host }: Readonly<LayoutProps>) {
  useSetupPage()

  const GlobalStyles = GlobalCoWDAOStyles(CoWDAOFonts)

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
      <MenuBar
        navItems={NAV_ITEMS}
        productVariant={PRODUCT_VARIANT}
        additionalNavButtons={NAV_ADDITIONAL_BUTTONS}
        padding="10px 60px"
        maxWidth={PAGE_MAX_WIDTH}
        LinkComponent={LinkComponent}
      />
      <Wrapper>{children}</Wrapper>
      <Footer
        maxWidth={PAGE_MAX_WIDTH}
        productVariant={PRODUCT_VARIANT}
        host={host ?? process.env.NEXT_PUBLIC_SITE_URL!}
        expanded
        hasTouchFooter
      />
    </>
  )
}
