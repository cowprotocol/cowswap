import { MenuBar, MenuItem, Footer, ProductVariant, GlobalCoWDAOStyles } from '@cowprotocol/ui'
import styled from 'styled-components/macro'

import IMG_ICON_BRANDED_DOT_RED from '@cowprotocol/assets/images/icon-branded-dot-red.svg'
import { CoWDAOFonts } from '@/styles/CoWDAOFonts'

const THEME_MODE = 'dark'
const PRODUCT_VARIANT = ProductVariant.CowDao

const NAV_ITEMS: MenuItem[] = [
  {
    label: 'About',
    children: [
      { label: 'Governance', href: 'https://docs.cow.fi/governance', external: true },
      { label: 'Stats', href: 'https://dune.com/cowprotocol/cowswap', external: true },
      { label: 'Grants', href: 'https://grants.cow.fi/', external: true },
      { label: 'Careers', href: '/careers' },
    ],
  },
  {
    label: 'Products',
    children: [
      {
        label: 'CoW Swap',
        children: [
          { label: 'About', href: '/cow-swap' },
          { label: 'CoW Swap for DAOs', href: '#' },
          {
            label: 'Trade on CoW Swap',
            href: 'https://swap.cow.fi/#/1/swap/USDC/COW',
            external: true,
            isButton: true,
            bgColor: '#012F7A',
            color: '#65D9FF',
          },
        ],
      },
      {
        label: 'CoW Protocol',
        children: [
          { label: 'About CoW Protocol', href: '/cow-protocol' },
          { label: 'CoW Explorer', href: 'https://explorer.cow.fi/', external: true },
          { label: 'CoW Widget', href: '/widget' },
          {
            label: 'Build with CoW Protocol',
            href: 'https://docs.cow.fi/cow-protocol',
            external: true,
            isButton: true,
          },
        ],
      },
      {
        label: 'CoW AMM',
        children: [
          { label: 'About CoW AMM', href: '/cow-amm' },
          {
            label: 'Deploy Liquidity with CoW AMM',
            href: 'https://deploy-cow-amm.bleu.fi/',
            external: true,
            isButton: true,
          },
        ],
      },
      {
        label: 'MEV Blocker',
        children: [
          { label: 'About MEV Blocker', href: '/mev-blocker' },
          { label: 'Use MEV Blocker', href: '/mev-blocker#rpc', isButton: true },
        ],
      },
    ],
  },
  {
    label: 'Learn',
    children: [
      {
        href: '/learn/what-is-backrunning-mev-attacks-explained',
        label: 'MEV 101',
        description: 'MEV Attacks Explained',
        icon: IMG_ICON_BRANDED_DOT_RED,
      },
      { href: '/learn', label: 'Knowledge Base', description: 'Learn more about CoW', icon: IMG_ICON_BRANDED_DOT_RED },
      { href: 'https://docs.cow.fi/', label: 'Docs', description: 'Read the docs', external: true },
    ],
  },
]

const NAV_ADDITIONAL_BUTTONS = [
  {
    label: 'Deploy Liquidity',
    href: 'https://deploy-cow-amm.bleu.fi/',
    external: true,
    isButton: true,
    bgColor: '#194D05',
    color: '#BCEC79',
  },
  { label: 'Use MEV Blocker', href: '/mev-blocker#rpc', isButton: true, bgColor: '#EC4612', color: '#FEE7CF' },
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
}

export default function LayoutV2({ children, bgColor }: LayoutProps) {
  const GlobalStyles = GlobalCoWDAOStyles(CoWDAOFonts, bgColor)

  return (
    <>
      <GlobalStyles />
      <MenuBar
        navItems={NAV_ITEMS}
        theme={THEME_MODE}
        productVariant={PRODUCT_VARIANT}
        additionalNavButtons={NAV_ADDITIONAL_BUTTONS}
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
