import React, { Dispatch, SetStateAction, useState } from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, ThemeToggler, Router } from 'storybook/decorators'

import { useMediaBreakpoint } from 'hooks/useMediaBreakPoint'
import { MenuTree, MenuTreeProps } from 'components/common/MenuDropdown/MenuTree'
import { MenuItemKind, MenuTreeItem } from './types'

import { DOCS_LINK, DISCORD_LINK, PROTOCOL_LINK, DUNE_DASHBOARD_LINK, Routes } from 'apps/explorer/const'
import IMAGE_COW from 'assets/img/CowProtocol-logo.svg'
import IMAGE_DISCORD from 'assets/img/discord.svg'
import IMAGE_DOC from 'assets/img/doc.svg'
import IMAGE_ANALYTICS from 'assets/img/pie.svg'
import IMAGE_APPDATA from 'assets/img/code.svg'

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

const useMobileMenuOpen = (): {
  isMobileMenuOpen: boolean
  handleMobileMenuOnClick: Dispatch<SetStateAction<boolean>>
} => {
  const [isMobileMenuOpen, handleMobileMenuOnClick] = useState(false)
  return { isMobileMenuOpen, handleMobileMenuOnClick }
}

const Template: Story<MenuTreeProps> = (args) => {
  const context = useMobileMenuOpen()
  const isMobile = useMediaBreakpoint(['xs', 'sm'])

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
