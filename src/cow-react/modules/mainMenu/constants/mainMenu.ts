import { Routes } from '@cow/constants/routes'
import { CONTRACTS_CODE_LINK, DISCORD_LINK, DOCS_LINK, DUNE_DASHBOARD_LINK, TWITTER_LINK } from 'constants/index'
import { BasicMenuLink, InternalLink, MainMenuItemId, MenuItemKind, MenuTreeItem } from '../types'

// Assets
import IMAGE_DOCS from 'assets/cow-swap/doc.svg'
import IMAGE_INFO from 'assets/cow-swap/info.svg'
import IMAGE_CODE from 'assets/cow-swap/code.svg'
import IMAGE_DISCORD from 'assets/cow-swap/discord.svg'
import IMAGE_TWITTER from 'assets/cow-swap/twitter.svg'
import IMAGE_PIE from 'assets/cow-swap/pie.svg'
import IMAGE_SLICER from 'assets/cow-swap/ninja-cow.png'
import IMAGE_GAME from 'assets/cow-swap/game.gif'

export const isBasicMenuLink = (item: any): item is BasicMenuLink => {
  return !!(item.title && item.url)
}

export const FAQ_MENU: InternalLink[] = [
  { id: MainMenuItemId.FAQ_OVERVIEW, title: 'Overview', url: Routes.FAQ },
  { id: MainMenuItemId.FAQ_PROTOCOL, title: 'Protocol', url: Routes.FAQ_PROTOCOL },
  { id: MainMenuItemId.FAQ_TOKEN, title: 'Token', url: Routes.FAQ_TOKEN },
  { id: MainMenuItemId.FAQ_TRADING, title: 'Trading', url: Routes.FAQ_TRADING },
  { id: MainMenuItemId.FAQ_AFFILIATE, title: 'Affiliate', url: Routes.FAQ_AFFILIATE },
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
          { id: MainMenuItemId.SWAP, kind: MenuItemKind.DYNAMIC_LINK, title: 'Swap', url: Routes.SWAP },
          {
            id: MainMenuItemId.LIMIT_ORDERS,
            kind: MenuItemKind.DYNAMIC_LINK,
            title: 'Limit orders',
            url: Routes.LIMIT_ORDER,
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
            iconSVG: IMAGE_DOCS,
          },
        ],
      },
    ],
  },
]
