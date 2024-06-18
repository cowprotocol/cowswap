import { MenuItem, ProductVariant } from '@cowprotocol/ui'

export const ROOT_DOMAIN = 'cow.fi'
export const THEME_MODE = 'dark'
export const PRODUCT_VARIANT = ProductVariant.CowDao

export const NAV_ITEMS: MenuItem[] = [
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

export const NAV_ADDITIONAL_BUTTONS = [
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
