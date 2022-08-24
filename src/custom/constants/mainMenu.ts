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

export interface BasicMenuLink {
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

export const FAQ_MENU: InternalLink[] = [
  { title: 'Overview', url: Routes.FAQ },
  { title: 'Protocol', url: Routes.FAQ_PROTOCOL },
  { title: 'Token', url: Routes.FAQ_TOKEN },
  { title: 'Trading', url: Routes.FAQ_TRADING },
  { title: 'Affiliate', url: Routes.FAQ_AFFILIATE },
]

export const MAIN_MENU: MenuTreeItem[] = [
  { title: 'Swap', url: Routes.SWAP },
  { title: 'Account', url: Routes.ACCOUNT },
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
          { title: 'Documentation', url: DOCS_LINK, iconSVG: IMAGE_DOCS, kind: MenuItemKind.EXTERNAL_LINK },
          { title: 'About', url: Routes.ABOUT, iconSVG: IMAGE_INFO },
          { title: 'Statistics', url: DUNE_DASHBOARD_LINK, iconSVG: IMAGE_PIE, kind: MenuItemKind.EXTERNAL_LINK },
          { title: 'Contract', url: CONTRACTS_CODE_LINK, iconSVG: IMAGE_CODE, kind: MenuItemKind.EXTERNAL_LINK },
        ],
      },
      {
        sectionTitle: 'Community',
        links: [
          { title: 'Discord', url: DISCORD_LINK, iconSVG: IMAGE_DISCORD, kind: MenuItemKind.EXTERNAL_LINK },
          { title: 'Twitter', url: TWITTER_LINK, iconSVG: IMAGE_TWITTER, kind: MenuItemKind.EXTERNAL_LINK },
        ],
      },
      {
        sectionTitle: 'Other',
        links: [
          { kind: MenuItemKind.DARK_MODE_BUTTON },
          { title: 'CoW Runner', url: Routes.PLAY_COWRUNNER, icon: IMAGE_GAME },
          { title: 'MEV Slicer', url: Routes.PLAY_MEVSLICER, icon: IMAGE_SLICER },
          { title: 'Terms and Conditions', url: Routes.TERMS_CONDITIONS, iconSVG: IMAGE_DOCS },
        ],
      },
    ],
  },
]
