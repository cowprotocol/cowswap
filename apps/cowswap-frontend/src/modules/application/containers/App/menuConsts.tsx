import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { MenuItem, ProductVariant } from '@cowprotocol/ui'

import { i18n } from '@lingui/core'
import { msg } from '@lingui/core/macro'

import AppziButton from 'legacy/components/AppziButton'
import { Version } from 'legacy/components/Version'

import { FortuneWidget } from 'modules/fortune/containers/FortuneWidget'

import { Routes } from 'common/constants/routes'

export const PRODUCT_VARIANT = ProductVariant.CowSwap

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const ACCOUNT_ITEM = (chainId: SupportedChainId) => ({
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
    {
      href: Routes.ACCOUNT_MY_REWARDS,
      label: msg`My rewards`,
    },
    {
      href: Routes.ACCOUNT_AFFILIATE,
      label: msg`Affiliate`,
    },
  ],
})

const LEARN_ITEM = {
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
  ],
}

const LEARN_ITEM_SUBMENU = {
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
}

const MORE_ITEM = {
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
      href: 'https://cow.fi/careers',
      label: msg`Careers`,
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
  const _ACCOUNT_ITEM = ACCOUNT_ITEM(chainId)
  const accountItem: MenuItem = {
    label: i18n._(_ACCOUNT_ITEM.label),
    children: _ACCOUNT_ITEM.children.map(({ href, label }) => ({
      href,
      label: i18n._(label),
    })),
  }

  const learnItem: MenuItem = {
    label: i18n._(LEARN_ITEM.label),
    children: [
      ...LEARN_ITEM.children.map(({ href, label, external }) => ({
        href,
        label: i18n._(label),
        external,
      })),
      {
        label: i18n._(LEARN_ITEM_SUBMENU.label),
        children: LEARN_ITEM_SUBMENU.children.map(({ href, label, external }) => ({
          href,
          label: i18n._(label),
          external,
        })),
      },
    ],
  }

  const moreItem: MenuItem = {
    label: i18n._(MORE_ITEM.label),
    children: MORE_ITEM.children.map(({ href, label, external }) => ({
      href,
      label: i18n._(label),
      external,
    })),
  }

  return [accountItem, learnItem, moreItem]
}

export const ADDITIONAL_FOOTER_CONTENT = (
  <>
    <Version />
    <FortuneWidget />
    <AppziButton />
  </>
)
