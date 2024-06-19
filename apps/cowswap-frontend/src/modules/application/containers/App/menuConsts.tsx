import IMG_ICON_COW_RUNNER from '@cowprotocol/assets/cow-swap/game.gif'
import IMG_ICON_COW_SLICER from '@cowprotocol/assets/cow-swap/ninja-cow.png'
import { MenuItem, ProductVariant } from '@cowprotocol/ui'

import AppziButton from 'legacy/components/AppziButton'

import { FortuneWidget } from 'modules/fortune/containers/FortuneWidget'

export const PRODUCT_VARIANT = ProductVariant.CowSwap
export const NAV_ITEMS: MenuItem[] = [
  {
    label: 'Trade',
    children: [
      { href: '/#/swap', label: 'Swap', description: 'Trade tokens' },
      { href: '/#/limit', label: 'Limit order', description: 'Set your own price' },
      { href: '/#/advanced', label: 'TWAP', description: 'Place orders with a time-weighted average price' },
    ],
  },
  {
    label: 'Account',
    children: [
      { href: '/#/account', label: 'Account' },
      {
        href: '/#/account/tokens',
        label: 'Tokens',
      },
    ],
  },
  {
    label: 'Learn',
    children: [
      {
        href: 'https://cow.fi/cow-swap',
        label: 'About CoW Swap',
        external: true,
      },
      { href: 'https://cow.fi/learn', label: 'FAQs', external: true },
      { href: 'https://docs.cow.fi/', label: 'Docs', external: true },
    ],
  },
  {
    label: 'More',
    children: [
      {
        href: 'https://cow.fi/cow-protocol',
        label: 'CoW Protocol',
        external: true,
      },
      {
        href: 'https://cow.fi/cow-amm',
        label: 'CoW AMM',
        external: true,
      },
      {
        href: '/#/play/cow-runner',
        label: 'CoW Runner',
        icon: IMG_ICON_COW_RUNNER,
      },
      {
        href: '/#/play/mev-slicer',
        label: 'MEV Slicer',
        icon: IMG_ICON_COW_SLICER,
      },
    ],
  },
]

export const FOOTER_NAV_ITEMS: MenuItem[] = [
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

export const ADDITIONAL_FOOTER_CONTENT = (
  <>
    <FortuneWidget />
    <AppziButton />
  </>
)
