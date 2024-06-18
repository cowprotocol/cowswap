import Head from 'next/head'
import { MenuBar, MenuItem, Footer, ProductVariant, GlobalCoWDAOStyles } from '@cowprotocol/ui'
import styled from 'styled-components/macro'
import { CONFIG } from '@/const/meta'
import { useEffect } from 'react'

import { CoWDAOFonts } from '@/styles/CoWDAOFonts'

const ROOT_DOMAIN = 'cow.fi'
const THEME_MODE = 'dark'
const PRODUCT_VARIANT = ProductVariant.CowDao

const NAV_ITEMS: MenuItem[] = [
  {
    label: 'About',
    children: [
      {
        label: 'Stats',
        href: 'https://dune.com/cowprotocol/cowswap',
        external: true,
      },
      {
        label: 'Governance',
        href: 'https://docs.cow.fi/governance',
        external: true,
      },
      {
        label: 'Grants',
        href: 'https://grants.cow.fi/',
        external: true,
      },
      { label: 'Careers', href: '/careers' },
      { label: 'Tokens', href: '/tokens' },
    ],
  },
  {
    label: 'Products',
    children: [
      {
        label: 'CoW Swap',
        href: '/cow-swap',
      },
      {
        label: 'CoW Protocol',
        href: '/cow-protocol',
      },
      {
        label: 'CoW AMM',
        href: '/cow-amm',
      },
      {
        label: 'MEV Blocker',
        href: '/mev-blocker',
      },
    ],
  },
  {
    label: 'Learn',
    children: [
      {
        href: '/learn',
        label: 'Knowledge Base',
      },
      {
        href: 'https://docs.cow.fi/',
        label: 'Docs',
        external: true,
      },
    ],
  },
]

const NAV_ADDITIONAL_BUTTONS = [
  {
    label: 'Deploy Liquidity',
    href: 'https://deploy-cow-amm.bleu.fi/',
    utmContent: 'menubar-nav-button-deploy-liquidity',
    external: true,
    isButton: true,
    bgColor: '#BCEC79',
    color: '#194D05',
  },

  {
    label: 'Trade on CoW Swap',
    href: 'https://swap.cow.fi/#/1/swap/USDC/COW',
    utmContent: 'menubar-nav-button-trade-on-cow-swap',
    external: true,
    isButton: true,
    bgColor: '#65D9FF',
    color: '#012F7A',
  },
]

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`

interface LayoutProps {
  children: React.ReactNode
  bgColor?: string
  metaTitle?: string
  metaDescription?: string
  ogImage?: string
}

export default function Layout({ children, bgColor, metaTitle, metaDescription, ogImage }: LayoutProps) {
  const GlobalStyles = GlobalCoWDAOStyles(CoWDAOFonts, bgColor)

  useEffect(() => {
    const anchorLinks = document.querySelectorAll('a[href^="#"]')
    anchorLinks.forEach((link) => {
      link.addEventListener('click', (event: Event) => {
        event.preventDefault()
        const targetId = ((event.target as HTMLElement).closest('a') as HTMLAnchorElement).getAttribute('href')
        if (targetId) {
          // Ensure targetId is not null
          const targetElement = document.querySelector(targetId)
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' })
          }
        }
      })
    })
  }, [])

  return (
    <>
      <Head>
        <title key="title">{`${metaTitle || `${CONFIG.title} - ${CONFIG.descriptionShort}`}`}</title>
        <meta key="ogTitle" property="og:title" content={metaTitle || `${CONFIG.title} - ${CONFIG.descriptionShort}`} />

        <meta key="description" name="description" content={metaDescription || CONFIG.descriptionShort} />
        <meta key="ogDescription" property="og:description" content={metaDescription || CONFIG.descriptionShort} />

        <meta
          key="twitterTitle"
          name="twitter:title"
          content={`${metaTitle || `${CONFIG.title} - ${CONFIG.descriptionShort}`}`}
        />
        <meta
          key="twitterDescription"
          name="twitter:description"
          content={metaDescription || CONFIG.descriptionShort}
        />

        <meta key="ogImage" property="og:image" content={ogImage || CONFIG.ogImage} />
        <meta key="twitterImage" name="twitter:image" content={ogImage || CONFIG.ogImage} />
      </Head>
      <GlobalStyles />
      <MenuBar
        navItems={NAV_ITEMS}
        theme={THEME_MODE}
        productVariant={PRODUCT_VARIANT}
        additionalNavButtons={NAV_ADDITIONAL_BUTTONS}
        padding="10px 60px"
        rootDomain={ROOT_DOMAIN}
      />
      <Wrapper>{children}</Wrapper>
      <Footer theme={THEME_MODE} productVariant={PRODUCT_VARIANT} expanded hasTouchFooter />
    </>
  )
}
