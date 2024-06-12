import Head from 'next/head'
import { MenuBar, MenuItem, Footer, ProductVariant, GlobalCoWDAOStyles } from '@cowprotocol/ui'
import styled from 'styled-components/macro'
import { CONFIG } from '@/const/meta'

import { CoWDAOFonts } from '@/styles/CoWDAOFonts'

const THEME_MODE = 'dark'
const PRODUCT_VARIANT = ProductVariant.CowDao

const NAV_ITEMS: MenuItem[] = [
  {
    label: 'About',
    children: [
      { label: 'Stats', href: 'https://dune.com/cowprotocol/cowswap', external: true },
      { label: 'Governance', href: 'https://docs.cow.fi/governance', external: true },
      { label: 'Grants', href: 'https://grants.cow.fi/', external: true },
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
    external: true,
    isButton: true,
    bgColor: '#BCEC79',
    color: '#194D05',
  },

  {
    label: 'Trade on CoW Swap',
    href: 'https://swap.cow.fi/#/1/swap/USDC/COW',
    external: true,
    isButton: true,
    bgColor: '#65D9FF',
    color: '#012F7A',
  },
]

const FOOTER_DESCRIPTION =
  'CoW DAO is an open organization of developers, market makers, and community contributors on a mission to protect users from the dangers of DeFi.'

const FOOTER_NAV_ITEMS: MenuItem[] = [
  {
    label: 'About',
    children: [
      { href: '#', label: 'Governance' },
      { href: '#', label: 'Token' },
      { href: '#', label: 'Grants' },
      { href: '#', label: 'Careers' },
      { href: '#', label: 'Brand Kit' },
    ],
  },
  {
    label: 'Legal',
    children: [
      { href: '#', label: 'Terms & Conditions' },
      { href: '#', label: 'Cookie Policy' },
      { href: '#', label: 'Privacy Policy' },
    ],
  },
  {
    label: 'Products',
    children: [
      { href: '#', label: 'CoW Swap' },
      { href: '#', label: 'CoW Protocol' },
      { href: '#', label: 'CoW AMM' },
      { href: '#', label: 'MEV Blocker' },
      { href: '#', label: 'Explorer' },
      { href: '#', label: 'Widget' },
      { href: '#', label: 'Hooks Store' },
    ],
  },
  {
    href: '#',
    label: 'Help',
    children: [
      { href: '#', label: 'Dev Docs' },
      { href: '#', label: 'FAQ / Knowledge base' },
      { href: '#', label: 'Send Feedback' },
      { href: '#', label: 'Report Scams' },
    ],
  },
  {
    label: 'Misc.',
    children: [
      { href: '#', label: 'Swag Store' },
      { href: '#', label: 'Token Charts' },
      { href: '#', label: 'For DAOs' },
    ],
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
      />
      <Wrapper>{children}</Wrapper>
      <Footer
        description={FOOTER_DESCRIPTION}
        navItems={FOOTER_NAV_ITEMS}
        theme={THEME_MODE}
        productVariant={PRODUCT_VARIANT}
        expanded
        hasTouchFooter
      />
    </>
  )
}
