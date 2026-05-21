import svgCodeSrc from 'assets/img/code.svg'
import svgCowProtocolSrc from 'assets/img/CowProtocol-logo.svg'
import svgDiscordSrc from 'assets/img/discord.svg'
import svgDocSrc from 'assets/img/doc.svg'
import svgPieSrc from 'assets/img/pie.svg'
import { PiMathOperationsFill } from 'react-icons/pi'

import { MenuItemKind, MenuLink, MenuTreeItem } from './types'

import {
  DOCS_LINK,
  DISCORD_LINK,
  PROTOCOL_LINK,
  COWSWAP_LINK,
  DUNE_DASHBOARD_LINK,
  Routes,
} from '../../../explorer/const'

export function getMainMenu(isSolversEnabled = true): MenuTreeItem[] {
  const otherLinks: MenuLink[] = [
    ...(isSolversEnabled
      ? [
          {
            title: 'Solvers',
            url: Routes.SOLVERS,
            iconComponent: PiMathOperationsFill,
            noPrefix: true,
          } satisfies MenuLink,
        ]
      : []),
    {
      title: 'AppData',
      url: Routes.APPDATA,
      iconSVG: svgCodeSrc,
    },
  ]

  return [
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
              title: 'CoW Swap',
              url: COWSWAP_LINK,
              kind: MenuItemKind.EXTERNAL_LINK,
              iconSVG: svgCowProtocolSrc,
            },
            {
              title: 'CoW Protocol',
              url: PROTOCOL_LINK,
              kind: MenuItemKind.EXTERNAL_LINK,
              iconSVG: svgCowProtocolSrc,
            },
            {
              title: 'Documentation',
              url: DOCS_LINK,
              kind: MenuItemKind.EXTERNAL_LINK,
              iconSVG: svgDocSrc,
            },
            {
              title: 'Analytics',
              url: DUNE_DASHBOARD_LINK,
              kind: MenuItemKind.EXTERNAL_LINK,
              iconSVG: svgPieSrc,
            },
          ],
        },
        {
          sectionTitle: 'COMMUNITY',
          links: [
            {
              title: 'Discord',
              url: DISCORD_LINK,
              iconSVG: svgDiscordSrc, // If icon is a <SVG> inline component
              kind: MenuItemKind.EXTERNAL_LINK,
            },
          ],
        },
        {
          sectionTitle: 'OTHER',
          links: otherLinks,
        },
      ],
    },
  ]
}

export const MAIN_MENU = getMainMenu()
