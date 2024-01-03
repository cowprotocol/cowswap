import React, { Dispatch, SetStateAction, useState } from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, ThemeToggler, Router } from 'storybook/decorators'

import MenuDropdown, { DropdownProps } from '.'
import { DropDownItem, MenuItemKind } from './types'

import { DOCS_LINK, DISCORD_LINK, PROTOCOL_LINK, Routes } from 'apps/explorer/const'
import IMAGE_COW from 'assets/img/CowProtocol-logo.svg'
import IMAGE_DISCORD from 'assets/img/discord.svg'
import IMAGE_DOC from 'assets/img/doc.svg'
import IMAGE_APPDATA from 'assets/img/code.svg'

export default {
  title: 'Common/MenuDropdownItem',
  component: MenuDropdown,
  decorators: [Router, GlobalStyles, ThemeToggler],
} as Meta

const DropdownMenu: DropDownItem = {
  kind: MenuItemKind.DROP_DOWN,
  title: 'Dropdown menu',
  items: [
    {
      sectionTitle: 'Section 1',
      links: [
        {
          title: 'Option 1',
          url: PROTOCOL_LINK,
          kind: MenuItemKind.EXTERNAL_LINK,
          iconSVG: IMAGE_COW,
        },
        {
          title: 'Option 2',
          url: DOCS_LINK,
          kind: MenuItemKind.EXTERNAL_LINK,
          iconSVG: IMAGE_DOC,
        },
      ],
    },
    {
      sectionTitle: 'Section 2',
      links: [
        {
          title: 'Option 3',
          url: DISCORD_LINK,
          iconSVG: IMAGE_DISCORD,
          kind: MenuItemKind.EXTERNAL_LINK,
        },
      ],
    },
    {
      sectionTitle: 'Section 3',
      links: [
        {
          title: 'Option 4',
          url: Routes.APPDATA,
          iconSVG: IMAGE_APPDATA,
        },
      ],
    },
  ],
}

const useMobileMenuOpen = (): {
  isMobileMenuOpen: boolean
  handleMobileMenuOnClick: Dispatch<SetStateAction<boolean>>
} => {
  const [isMobileMenuOpen, handleMobileMenuOnClick] = useState(false)
  return { isMobileMenuOpen, handleMobileMenuOnClick }
}

const Template: Story<DropdownProps> = () => {
  const context = useMobileMenuOpen()
  return (
    <MenuDropdown
      menuItem={DropdownMenu}
      context={{
        isMobileMenuOpen: context.isMobileMenuOpen,
        handleMobileMenuOnClick: (): void => context.handleMobileMenuOnClick((prevState) => !prevState),
      }}
    />
  )
}

const defaultProps: Omit<DropdownProps, 'menuItem'> = {
  context: { isMobileMenuOpen: false, handleMobileMenuOnClick: () => console.log },
}

export const singleDropdown = Template.bind({})
singleDropdown.args = {
  ...defaultProps,
}
