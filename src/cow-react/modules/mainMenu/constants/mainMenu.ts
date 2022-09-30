import { Routes } from 'constants/routes'
import { DUNE_DASHBOARD_LINK, CONTRACTS_CODE_LINK, DOCS_LINK, DISCORD_LINK, TWITTER_LINK } from 'constants/index'

// Assets
import IMAGE_DOCS from 'assets/cow-swap/doc.svg'
import IMAGE_INFO from 'assets/cow-swap/info.svg'
import IMAGE_CODE from 'assets/cow-swap/code.svg'
import IMAGE_DISCORD from 'assets/cow-swap/discord.svg'
import IMAGE_TWITTER from 'assets/cow-swap/twitter.svg'
import IMAGE_PIE from 'assets/cow-swap/pie.svg'
import IMAGE_SLICER from 'assets/cow-swap/ninja-cow.png'
import IMAGE_GAME from 'assets/cow-swap/game.gif'

export enum MenuItemKind {
  DROP_DOWN = 'DROP_DOWN',
  EXTERNAL_LINK = 'EXTERNAL_LINK',
  DARK_MODE_BUTTON = 'DARK_MODE_BUTTON',
}

export enum MainMenuItemId {
  SWAP = 'SWAP',
  LIMIT_ORDERS = 'LIMIT_ORDERS',
  FAQ_OVERVIEW = 'FAQ_OVERVIEW',
  FAQ_PROTOCOL = 'FAQ_PROTOCOL',
  FAQ_TOKEN = 'FAQ_TOKEN',
  FAQ_TRADING = 'FAQ_TRADING',
  FAQ_AFFILIATE = 'FAQ_AFFILIATE',
  ACCOUNT_OVERVIEW = 'ACCOUNT_OVERVIEW',
  ACCOUNT_TOKENS = 'ACCOUNT_TOKENS',
  MORE_DOCUMENTATION = 'MORE_DOCUMENTATION',
  MORE_ABOUT = 'MORE_ABOUT',
  MORE_STATISTICS = 'MORE_STATISTICS',
  MORE_CONTRACT = 'MORE_CONTRACT',
  MORE_DISCORD = 'MORE_DISCORD',
  MORE_TWITTER = 'MORE_TWITTER',
  OTHER_COW_RUNNER = 'OTHER_COW_RUNNER',
  OTHER_MEV_SLICER = 'OTHER_MEV_SLICER',
  OTHER_TERMS_AND_CONDITIONS = 'OTHER_TERMS_AND_CONDITIONS',
}

export interface BasicMenuLink {
  id: MainMenuItemId
  title: string
  url: string
  icon?: string // If icon uses a regular <img /> tag
  iconSVG?: string // If icon is a <SVG> inline component
}
export interface InternalLink extends BasicMenuLink {
  kind?: undefined
}

export interface ExternalLink extends BasicMenuLink {
  kind: MenuItemKind.EXTERNAL_LINK
}

export type DarkModeLink = { kind: MenuItemKind.DARK_MODE_BUTTON }

export type MenuLink = InternalLink | ExternalLink | DarkModeLink

export interface DropDownSubItem {
  sectionTitle?: string
  links: MenuLink[]
}

export interface DropDownItem {
  kind: MenuItemKind.DROP_DOWN
  title: string
  items: DropDownSubItem[]
}

export type MenuTreeItem = InternalLink | ExternalLink | DropDownItem

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
  { id: MainMenuItemId.SWAP, title: 'Swap', url: Routes.SWAP },
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

if (localStorage.getItem('enableLimitOrders')) {
  MAIN_MENU.splice(1, 0, { id: MainMenuItemId.LIMIT_ORDERS, title: 'Limit orders', url: Routes.LIMIT_ORDER })
}
