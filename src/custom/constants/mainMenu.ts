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

export interface MAIN_MENU_TYPE {
  title: string
  url?: string
  externalURL?: boolean
  items?: {
    sectionTitle: string
    links: {
      title?: string
      url?: string // If URL is an internal route
      externalURL?: boolean // If URL is external
      icon?: string // If icon uses a regular <img /> tag
      iconSVG?: string // If icon is a <SVG> inline component
      action?: string // Special purpose flag for non-regular links
    }[]
  }[]
}

export const MAIN_MENU = [
  { title: 'Swap', url: Routes.SWAP },
  { title: 'Account', url: Routes.ACCOUNT },
  { title: 'FAQ', url: Routes.FAQ },
  {
    title: 'More',
    items: [
      {
        sectionTitle: 'Overview',
        links: [
          { title: 'Documentation', url: DOCS_LINK, externalURL: true, iconSVG: IMAGE_DOCS },
          { title: 'About', url: Routes.ABOUT, icon: IMAGE_INFO },
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
        ],
      },
    ],
  },
]
