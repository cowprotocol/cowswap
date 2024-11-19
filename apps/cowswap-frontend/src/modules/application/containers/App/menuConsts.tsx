import { BadgeTypes, MenuItem, ProductVariant } from '@cowprotocol/ui'

import AppziButton from 'legacy/components/AppziButton'
import { Version } from 'legacy/components/Version'

import { FortuneWidget } from 'modules/fortune/containers/FortuneWidget'

import { Routes } from 'common/constants/routes'

export const PRODUCT_VARIANT = ProductVariant.CowSwap
export const NAV_ITEMS: MenuItem[] = [
  {
    label: 'Account',
    children: [
      { href: '/account', label: 'Account' },
      {
        href: '/account/tokens',
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
      {
        label: 'Legal',
        children: [
          { href: 'https://cow.fi/legal/cowswap-privacy-policy', label: 'Privacy Policy', external: true },
          { href: 'https://cow.fi/legal/cowswap-cookie-policy', label: 'Cookie Policy', external: true },
          { href: 'https://cow.fi/legal/cowswap-terms', label: 'Terms and Conditions', external: true },
        ],
      },
    ],
  },
  {
    label: 'More',
    badge: 'New',
    badgeType: BadgeTypes.ALERT,
    children: [
      {
        href: 'https://cow.fi/cow-protocol',
        label: 'CoW Protocol',
        external: true,
      },
      {
        href: 'https://cow.fi/cow-amm',
        label: 'CoW AMM',
        badge: 'New',
        badgeType: BadgeTypes.ALERT,
        external: true,
      },
      {
        href: Routes.PLAY_COWRUNNER,
        label: 'CoW Runner',
        // icon: IMG_ICON_COW_RUNNER,
      },
      {
        href: Routes.PLAY_MEVSLICER,
        label: 'MEV Slicer',
        // icon: IMG_ICON_COW_SLICER,
      },
    ],
  },
]

export const ADDITIONAL_FOOTER_CONTENT = (
  <>
    <Version />
    <FortuneWidget />
    <AppziButton />
  </>
)
