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

export interface BasicMenuLink {
  title?: string // FIXME: This title should be mandatory, only because of the "setColorMode" is not. Model this better
  // TODO: Can we just have a type, and a default?
  url?: string // If URL is an internal route
  externalURL?: boolean // If URL is external
}
export interface MenuLink extends BasicMenuLink {
  icon?: string // If icon uses a regular <img /> tag
  iconSVG?: string // If icon is a <SVG> inline component
  // TODO: Review why we need this?
  action?: string // Special purpose flag for non-regular links
}
export interface MenuTreeSubItem {
  sectionTitle?: string
  links: MenuLink[]
}

export interface MenuTreeItem extends BasicMenuLink {
  title: string
  items?: MenuTreeSubItem[]
}

// FIXME: Remove ({ title: string } when modeled properly. See other fixmes
export const FAQ_MENU: ({ title: string; url: string } & MenuLink)[] = [
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
    title: 'FAQ',
    items: [
      {
        links: FAQ_MENU,
      },
    ],
  },
  {
    title: 'More',
    items: [
      {
        sectionTitle: 'Overview',
        links: [
          { title: 'Documentation', url: DOCS_LINK, externalURL: true, iconSVG: IMAGE_DOCS },
          { title: 'About', url: Routes.ABOUT, iconSVG: IMAGE_INFO },
          { title: 'Statistics', url: DUNE_DASHBOARD_LINK, externalURL: true, iconSVG: IMAGE_PIE },
          { title: 'Contract', url: CONTRACTS_CODE_LINK, externalURL: true, iconSVG: IMAGE_CODE },
        ],
      },
      {
        sectionTitle: 'Community',
        links: [
          { title: 'Discord', url: DISCORD_LINK, externalURL: true, iconSVG: IMAGE_DISCORD },
          { title: 'Twitter', url: TWITTER_LINK, externalURL: true, iconSVG: IMAGE_TWITTER },
        ],
      },
      {
        sectionTitle: 'Other',
        links: [
          { action: 'setColorMode' },
          { title: 'CoW Runner', url: Routes.PLAY_COWRUNNER, icon: IMAGE_GAME },
          { title: 'MEV Slicer', url: Routes.PLAY_MEVSLICER, icon: IMAGE_SLICER },
          { title: 'Terms and Conditions', url: Routes.TERMS_CONDITIONS, iconSVG: IMAGE_DOCS },
        ],
      },
    ],
  },
]
