import React, { Dispatch, SetStateAction, useState } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media } from '@cowprotocol/ui'

import { Story, Meta } from '@storybook/react/types-6-0'
import svgCodeSrc from 'assets/img/code.svg'
import svgCowProtocolSrc from 'assets/img/CowProtocol-logo.svg'
import svgDiscordSrc from 'assets/img/discord.svg'
import svgDocSrc from 'assets/img/doc.svg'
import svgPieSrc from 'assets/img/pie.svg'
import { MenuTree, MenuTreeProps } from 'components/common/MenuDropdown/MenuTree'
import { GlobalStyles, ThemeToggler, Router } from 'storybook/decorators'

import { MenuItemKind, MenuTreeItem } from './types'

import {
  DOCS_LINK,
  DISCORD_LINK,
  PROTOCOL_LINK,
  COWSWAP_LINK,
  DUNE_DASHBOARD_LINK,
  Routes,
} from '../../../explorer/const'

export default {
  title: 'Common/Menu',
  component: MenuTree,
  decorators: [Router, GlobalStyles, ThemeToggler],
} as Meta

const DropdownMenu: MenuTreeItem[] = [
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
        links: [
          {
            title: 'AppData',
            url: Routes.APPDATA,
            iconSVG: svgCodeSrc,
          },
        ],
      },
    ],
  },
]

const useMobileMenuOpen = (): {
  isMobileMenuOpen: boolean
  handleMobileMenuOnClick: Dispatch<SetStateAction<boolean>>
} => {
  const [isMobileMenuOpen, handleMobileMenuOnClick] = useState(false)
  return { isMobileMenuOpen, handleMobileMenuOnClick }
}

const Template: Story<MenuTreeProps> = (args) => {
  const context = useMobileMenuOpen()
  const isMobile = useMediaQuery(Media.upToSmall(false))

  return (
    <MenuTree
      {...args}
      isMobile={isMobile}
      isMobileMenuOpen={context.isMobileMenuOpen}
      handleMobileMenuOnClick={(): void => context.handleMobileMenuOnClick((prevState) => !prevState)}
    />
  )
}

const defaultProps: Omit<MenuTreeProps, 'handleMobileMenuOnClick' | 'isMobileMenuOpen'> = {
  menuList: DropdownMenu,
}

export const MainMenu = Template.bind({})
MainMenu.args = {
  ...defaultProps,
}
