import IMAGE_CODE from '@cowprotocol/assets/cow-swap/code.svg'
import IMAGE_COOKIE_POLICY from '@cowprotocol/assets/cow-swap/cookie-policy.svg'
import IMAGE_DISCORD from '@cowprotocol/assets/cow-swap/discord.svg'
import IMAGE_DOCS from '@cowprotocol/assets/cow-swap/doc.svg'
import IMAGE_GAME from '@cowprotocol/assets/cow-swap/game.gif'
import IMAGE_INFO from '@cowprotocol/assets/cow-swap/info.svg'
import IMAGE_SLICER from '@cowprotocol/assets/cow-swap/ninja-cow.png'
import IMAGE_PIE from '@cowprotocol/assets/cow-swap/pie.svg'
import IMAGE_PRIVACY_POLICY from '@cowprotocol/assets/cow-swap/privacy-policy.svg'
import IMAGE_TERMS_AND_CONDITIONS from '@cowprotocol/assets/cow-swap/terms-and-conditions.svg'
import IMAGE_TWITTER from '@cowprotocol/assets/cow-swap/twitter.svg'
import IMAGE_WIDGET_ICON from '@cowprotocol/assets/cow-swap/widget-icon.svg'
import {
  CONTRACTS_CODE_LINK,
  DISCORD_LINK,
  DOCS_LINK,
  DUNE_DASHBOARD_LINK,
  TWITTER_LINK,
  WIDGET_LANDING_LINK,
} from '@cowprotocol/common-const'
import { getExplorerBaseUrl } from '@cowprotocol/common-utils'
import { ExternalLink } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Globe } from 'react-feather'

import { Routes } from 'common/constants/routes'

import { InternalLink, MainMenuItemId, MenuItemKind, MenuTreeItem } from '../types'

function ExplorerMenuLink() {
  const { chainId } = useWalletInfo()
  const url = getExplorerBaseUrl(chainId)

  return (
    <ExternalLink href={url}>
      <Globe /> CoW Explorer
    </ExternalLink>
  )
}

export const FAQ_MENU: InternalLink[] = [
  { id: MainMenuItemId.FAQ_OVERVIEW, title: 'Overview', url: Routes.FAQ },
  { id: MainMenuItemId.FAQ_PROTOCOL, title: 'Protocol', url: Routes.FAQ_PROTOCOL },
  { id: MainMenuItemId.FAQ_TOKEN, title: 'Token', url: Routes.FAQ_TOKEN },
  { id: MainMenuItemId.FAQ_TRADING, title: 'Trading', url: Routes.FAQ_TRADING },
  { id: MainMenuItemId.FAQ_LIMIT_ORDERS, title: 'Limit orders', url: Routes.FAQ_LIMIT_ORDERS },
  { id: MainMenuItemId.FAQ_ETH_FLOW, title: 'Selling Native tokens', url: Routes.FAQ_ETH_FLOW },
]

export const ACCOUNT_MENU: InternalLink[] = [
  { id: MainMenuItemId.ACCOUNT_OVERVIEW, title: 'Overview', url: Routes.ACCOUNT },
  { id: MainMenuItemId.ACCOUNT_TOKENS, title: 'Tokens', url: Routes.ACCOUNT_TOKENS },
]

export const MAIN_MENU: MenuTreeItem[] = [
  {
    kind: MenuItemKind.DROP_DOWN,
    title: 'Trade',
    items: [
      {
        links: [
          { id: MainMenuItemId.SWAP, kind: MenuItemKind.PARAMETRIZED_LINK, title: 'Swap', url: Routes.SWAP },
          {
            id: MainMenuItemId.LIMIT_ORDERS,
            kind: MenuItemKind.PARAMETRIZED_LINK,
            title: 'Limit',
            url: Routes.LIMIT_ORDER,
          },
          {
            id: MainMenuItemId.ADVANCED_ORDERS,
            kind: MenuItemKind.PARAMETRIZED_LINK,
            title: 'TWAP',
            url: Routes.ADVANCED_ORDERS,
          },
        ],
      },
    ],
  },
  {
    kind: MenuItemKind.DROP_DOWN,
    title: 'Account',
    items: [
      {
        links: ACCOUNT_MENU,
      },
    ],
  },
  {
    kind: MenuItemKind.DROP_DOWN,
    title: 'FAQ',
    items: [
      {
        links: FAQ_MENU,
      },
    ],
  },
  {
    kind: MenuItemKind.DROP_DOWN,
    title: 'More',
    badge: 'New!',
    items: [
      {
        sectionTitle: 'Overview',
        links: [
          {
            id: MainMenuItemId.MORE_DOCUMENTATION,
            title: 'Documentation',
            url: DOCS_LINK,
            iconSVG: IMAGE_DOCS,
            kind: MenuItemKind.EXTERNAL_LINK,
          },
          { id: MainMenuItemId.MORE_ABOUT, title: 'About', url: Routes.ABOUT, iconSVG: IMAGE_INFO },
          {
            kind: MenuItemKind.CUSTOM_ITEM,
            Item: ExplorerMenuLink,
          },
          {
            id: MainMenuItemId.MORE_STATISTICS,
            title: 'Statistics',
            url: DUNE_DASHBOARD_LINK,
            iconSVG: IMAGE_PIE,
            kind: MenuItemKind.EXTERNAL_LINK,
          },
          {
            id: MainMenuItemId.MORE_CONTRACT,
            title: 'Contract',
            url: CONTRACTS_CODE_LINK,
            iconSVG: IMAGE_CODE,
            kind: MenuItemKind.EXTERNAL_LINK,
          },

          {
            id: MainMenuItemId.WIDGET,
            title: 'Widget',
            url: WIDGET_LANDING_LINK,
            iconSVG: IMAGE_WIDGET_ICON,
            kind: MenuItemKind.EXTERNAL_LINK,
            badge: 'New!',
          },
        ],
      },
      {
        sectionTitle: 'Community',
        links: [
          {
            id: MainMenuItemId.MORE_DISCORD,
            title: 'Discord',
            url: DISCORD_LINK,
            iconSVG: IMAGE_DISCORD,
            kind: MenuItemKind.EXTERNAL_LINK,
          },
          {
            id: MainMenuItemId.MORE_TWITTER,
            title: 'Twitter',
            url: TWITTER_LINK,
            iconSVG: IMAGE_TWITTER,
            kind: MenuItemKind.EXTERNAL_LINK,
          },
        ],
      },
      {
        sectionTitle: 'Other',
        links: [
          { kind: MenuItemKind.DARK_MODE_BUTTON },
          { id: MainMenuItemId.OTHER_COW_RUNNER, title: 'CoW Runner', url: Routes.PLAY_COWRUNNER, icon: IMAGE_GAME },
          { id: MainMenuItemId.OTHER_MEV_SLICER, title: 'MEV Slicer', url: Routes.PLAY_MEVSLICER, icon: IMAGE_SLICER },
          {
            id: MainMenuItemId.OTHER_TERMS_AND_CONDITIONS,
            title: 'Terms and Conditions',
            url: Routes.TERMS_CONDITIONS,
            iconSVG: IMAGE_TERMS_AND_CONDITIONS,
          },
          {
            id: MainMenuItemId.OTHER_COOKIE_POLICY,
            title: 'Cookie Policy',
            url: Routes.COOKIE_POLICY,
            iconSVG: IMAGE_COOKIE_POLICY,
          },
          {
            id: MainMenuItemId.OTHER_PRIVACY_POLICY,
            title: 'Privacy Policy',
            url: Routes.PRIVACY_POLICY,
            iconSVG: IMAGE_PRIVACY_POLICY,
          },
        ],
      },
    ],
  },
]
