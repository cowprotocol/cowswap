import { MenuItem, ProductVariant, Color, UI } from '@cowprotocol/ui'
import { initGtm } from '@cowprotocol/analytics'
import { CowFiCategory } from 'src/common/analytics/types'

const analytics = initGtm()

export const PAGE_MAX_WIDTH = 1760
export const THEME_MODE = 'light'
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
      {
        label: 'More',
        children: [
          {
            label: 'Widget',
            href: '/widget',
          },
          {
            label: 'CoW Explorer',
            href: 'https://explorer.cow.fi/',
            external: true,
            utmContent: 'menubar-nav-item-cow-explorer',
          },
        ],
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
        utmContent: 'menubar-nav-item-docs',
      },
    ],
  },
]

export const NAV_ADDITIONAL_BUTTONS = [
  {
    label: 'LP on CoW AMM',
    href: 'https://balancer.fi/pools/cow',
    utmContent: 'menubar-nav-button-lp-on-cow-amm',
    onClick: () =>
      analytics.sendEvent({
        category: CowFiCategory.NAVIGATION,
        action: 'Click LP on CoW AMM',
        label: 'menubar-nav-button',
      }),
    external: true,
    isButton: true,
    bgColor: Color.cowamm_dark_green,
    color: Color.cowamm_green,
  },
  {
    label: 'Trade on CoW Swap',
    href: 'https://swap.cow.fi/#/1/swap/USDC/COW',
    utmContent: 'menubar-nav-button-trade-on-cow-swap',
    onClick: () =>
      analytics.sendEvent({
        category: CowFiCategory.NAVIGATION,
        action: 'Click Trade on CoW Swap',
        label: 'menubar-nav-button',
      }),
    external: true,
    isButton: true,
    bgColor: `var(${UI.COLOR_BLUE_300_PRIMARY})`,
    color: `var(${UI.COLOR_BLUE_900_PRIMARY})`,
  },
]
