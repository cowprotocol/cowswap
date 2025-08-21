import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { MenuItem, ProductVariant } from '@cowprotocol/ui'

import { msg } from '@lingui/core/macro'

import AppziButton from 'legacy/components/AppziButton'
import { Version } from 'legacy/components/Version'

import { FortuneWidget } from 'modules/fortune/containers/FortuneWidget'

import { Routes } from 'common/constants/routes'

export const PRODUCT_VARIANT = ProductVariant.CowSwap

const accountItem = (chainId: SupportedChainId): MenuItem => ({
  label: msg`Account`,
  children: [
    {
      href: '/account',
      label: msg`Account`,
    },
    {
      href: '/account/tokens',
      label: msg`Tokens`,
    },
    {
      href: `/${chainId}/account-proxy`,
      label: ACCOUNT_PROXY_LABEL,
    },
  ],
})

const learnItem: MenuItem = {
  label: msg`Learn`,
  children: [
    {
      href: 'https://cow.fi/cow-swap',
      label: msg`About CoW Swap`,
      external: true,
    },
    {
      href: 'https://cow.fi/learn',
      label: msg`FAQs`,
      external: true,
    },
    {
      href: 'https://docs.cow.fi/',
      label: msg`Docs`,
      external: true,
    },
    {
      label: msg`Legal`,
      children: [
        {
          href: 'https://cow.fi/legal/cowswap-privacy-policy',
          label: msg`Privacy Policy`,
          external: true,
        },
        {
          href: 'https://cow.fi/legal/cowswap-cookie-policy',
          label: msg`Cookie Policy`,
          external: true,
        },
        {
          href: 'https://cow.fi/legal/cowswap-terms',
          label: msg`Terms and Conditions`,
          external: true,
        },
      ],
    },
  ],
}

const moreItem: MenuItem = {
  label: msg`More`,
  children: [
    {
      href: 'https://cow.fi/cow-protocol',
      label: msg`CoW Protocol`,
      external: true,
    },
    {
      href: 'https://cow.fi/cow-amm',
      label: msg`CoW AMM`,
      external: true,
    },
    {
      href: Routes.PLAY_COWRUNNER,
      label: msg`CoW Runner`,
      // icon: IMG_ICON_COW_RUNNER,
    },
    {
      href: Routes.PLAY_MEVSLICER,
      label: msg`MEV Slicer`,
      // icon: IMG_ICON_COW_SLICER,
    },
  ],
}

export const NAV_ITEMS = (chainId: SupportedChainId): MenuItem[] => {
  return [accountItem(chainId), learnItem, moreItem]
}

export const ADDITIONAL_FOOTER_CONTENT = (
  <>
    <Version />
    <FortuneWidget />
    <AppziButton />
  </>
)
