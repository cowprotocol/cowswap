import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { MenuItem, ProductVariant } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import AppziButton from 'legacy/components/AppziButton'
import { Version } from 'legacy/components/Version'

import { FortuneWidget } from 'modules/fortune/containers/FortuneWidget'

import { Routes } from 'common/constants/routes'

export const PRODUCT_VARIANT = ProductVariant.CowSwap
export const NAV_ITEMS = (chainId: SupportedChainId): MenuItem[] => {
  return [
    {
      label: t`Account`,
      children: [
        { href: '/account', label: t`Account` },
        {
          href: '/account/tokens',
          label: t`Tokens`,
        },
        {
          href: `/${chainId}/account-proxy`,
          label: ACCOUNT_PROXY_LABEL,
        },
      ],
    },
    {
      label: t`Learn`,
      children: [
        {
          href: 'https://cow.fi/cow-swap',
          label: t`About CoW Swap`,
          external: true,
        },
        { href: 'https://cow.fi/learn', label: t`FAQs`, external: true },
        { href: 'https://docs.cow.fi/', label: t`Docs`, external: true },
        {
          label: t`Legal`,
          children: [
            { href: 'https://cow.fi/legal/cowswap-privacy-policy', label: t`Privacy Policy`, external: true },
            { href: 'https://cow.fi/legal/cowswap-cookie-policy', label: t`Cookie Policy`, external: true },
            { href: 'https://cow.fi/legal/cowswap-terms', label: t`Terms and Conditions`, external: true },
          ],
        },
      ],
    },
    {
      label: t`More`,
      children: [
        {
          href: 'https://cow.fi/cow-protocol',
          label: t`CoW Protocol`,
          external: true,
        },
        {
          href: 'https://cow.fi/cow-amm',
          label: t`CoW AMM`,
          external: true,
        },
        {
          href: Routes.PLAY_COWRUNNER,
          label: t`CoW Runner`,
          // icon: IMG_ICON_COW_RUNNER,
        },
        {
          href: Routes.PLAY_MEVSLICER,
          label: t`MEV Slicer`,
          // icon: IMG_ICON_COW_SLICER,
        },
      ],
    },
  ]
}

export const ADDITIONAL_FOOTER_CONTENT = (
  <>
    <Version />
    <FortuneWidget />
    <AppziButton />
  </>
)
