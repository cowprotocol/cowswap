import { DOCS_LINK, DISCORD_LINK, PROTOCOL_LINK, DUNE_DASHBOARD_LINK, Routes } from 'apps/explorer/const'
import IMAGE_COW from 'assets/img/CowProtocol-logo.svg'
import IMAGE_DISCORD from 'assets/img/discord.svg'
import IMAGE_DOC from 'assets/img/doc.svg'
import IMAGE_ANALYTICS from 'assets/img/pie.svg'
import IMAGE_APPDATA from 'assets/img/code.svg'

import { MenuItemKind, MenuTreeItem } from './types'

export const MAIN_MENU: MenuTreeItem[] = [
  {
    title: 'Home',
    url: Routes.HOME,
  },
  {
    kind: MenuItemKind.DROP_DOWN,
    title: 'More',
    items: [
      {
        sectionTitle: 'OVERVIEW',
        links: [
          {
            title: 'CoW Protocol',
            url: PROTOCOL_LINK,
            kind: MenuItemKind.EXTERNAL_LINK,
            iconSVG: IMAGE_COW,
          },
          {
            title: 'Documentation',
            url: DOCS_LINK,
            kind: MenuItemKind.EXTERNAL_LINK,
            iconSVG: IMAGE_DOC,
          },
          {
            title: 'Analytics',
            url: DUNE_DASHBOARD_LINK,
            kind: MenuItemKind.EXTERNAL_LINK,
            iconSVG: IMAGE_ANALYTICS,
          },
        ],
      },
      {
        sectionTitle: 'COMMUNITY',
        links: [
          {
            title: 'Discord',
            url: DISCORD_LINK,
            iconSVG: IMAGE_DISCORD, // If icon is a <SVG> inline component
            kind: MenuItemKind.EXTERNAL_LINK,
          },
        ],
      },
      {
        sectionTitle: 'OTHER',
        links: [
          {
            title: 'AppData',
            url: Routes.APPDATA,
            iconSVG: IMAGE_APPDATA,
          },
        ],
      },
    ],
  },
]
