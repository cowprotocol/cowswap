import Head from 'next/head'
import { Media, MenuBar, Footer, GlobalCoWDAOStyles } from '@cowprotocol/ui'
import styled, { createGlobalStyle, css } from 'styled-components/macro'
import { CONFIG } from '@/const/meta'
import { CoWDAOFonts } from '@/styles/CoWDAOFonts'
import { PAGE_MAX_WIDTH, PRODUCT_VARIANT, NAV_ADDITIONAL_BUTTONS, NAV_ITEMS } from './const'
import getURL from '@/util/getURL'

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
  metaTitle?: string
  metaDescription?: string
  ogImage?: string
  host?: string
}

export default function Layout({ children, bgColor, metaTitle, metaDescription, ogImage, host }: LayoutProps) {
  const GlobalStyles = GlobalCoWDAOStyles(CoWDAOFonts)

  const LocalStyles = createGlobalStyle(
    () => css`
      body {
        background: ${bgColor};
      }
    `
  )

  const finalHost = host || getURL('')

  return (
    <>
      <Head>
        <title key="title">{`${metaTitle || `${CONFIG.title} - ${CONFIG.descriptionShort}`}`}</title>
        <meta key="ogTitle" property="og:title" content={metaTitle || `${CONFIG.title} - ${CONFIG.descriptionShort}`} />

        <meta key="description" name="description" content={metaDescription || CONFIG.description} />
        <meta key="ogDescription" property="og:description" content={metaDescription || CONFIG.description} />

        <meta
          key="twitterTitle"
          name="twitter:title"
          content={`${metaTitle || `${CONFIG.title} - ${CONFIG.description}`}`}
        />
        <meta key="twitterDescription" name="twitter:description" content={metaDescription || CONFIG.description} />

        <meta key="ogImage" property="og:image" content={ogImage || CONFIG.ogImage} />
        <meta key="twitterImage" name="twitter:image" content={ogImage || CONFIG.ogImage} />
      </Head>
      <GlobalStyles />
      <LocalStyles />
      <MenuBar
        navItems={NAV_ITEMS}
        productVariant={PRODUCT_VARIANT}
        additionalNavButtons={NAV_ADDITIONAL_BUTTONS}
        padding="10px 60px"
        maxWidth={PAGE_MAX_WIDTH}
      />
      <Wrapper>{children}</Wrapper>
      <Footer maxWidth={PAGE_MAX_WIDTH} productVariant={PRODUCT_VARIANT} host={finalHost} expanded hasTouchFooter />
    </>
  )
}
