import { PropsWithChildren } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { Footer, GlobalCoWDAOStyles, Media, MenuBar } from '@cowprotocol/ui'
import styled, { createGlobalStyle, css } from 'styled-components/macro'

import { CONFIG } from '@/const/meta'
import { CoWDAOFonts } from '@/styles/CoWDAOFonts'
import getURL from '@/util/getURL'
import { NAV_ADDITIONAL_BUTTONS, NAV_ITEMS, PAGE_MAX_WIDTH, PRODUCT_VARIANT } from './const'

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

const metaTitleWithShortDescription = `${CONFIG.title} - ${CONFIG.descriptionShort}`
const metaTitleWithDescription = `${CONFIG.title} - ${CONFIG.description}`

interface LayoutProps {
  children: React.ReactNode
  bgColor?: string
  metaTitle?: string
  metaDescription?: string
  ogImage?: string
  host?: string
}

export default function Layout({
  children,
  bgColor,
  metaTitle,
  metaDescription,
  ogImage,
  host,
}: Readonly<LayoutProps>) {
  const GlobalStyles = GlobalCoWDAOStyles(CoWDAOFonts)

  const LocalStyles = createGlobalStyle(
    () => css`
      body {
        background: ${bgColor};
      }
    `
  )

  const finalHost = host ?? getURL('')

  return (
    <>
      <Head>
        <title key="title">{`${metaTitle ?? metaTitleWithDescription}`}</title>
        <meta key="ogTitle" property="og:title" content={metaTitle ?? metaTitleWithDescription} />

        <meta key="description" name="description" content={metaDescription ?? CONFIG.description} />
        <meta key="ogDescription" property="og:description" content={metaDescription ?? CONFIG.description} />

        <meta key="twitterTitle" name="twitter:title" content={`${metaTitle ?? metaTitleWithShortDescription}`} />
        <meta key="twitterDescription" name="twitter:description" content={metaDescription ?? CONFIG.description} />

        <meta key="ogImage" property="og:image" content={ogImage ?? CONFIG.ogImage} />
        <meta key="twitterImage" name="twitter:image" content={ogImage ?? CONFIG.ogImage} />
      </Head>
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
      <Footer maxWidth={PAGE_MAX_WIDTH} productVariant={PRODUCT_VARIANT} host={finalHost} expanded hasTouchFooter />
    </>
  )
}
