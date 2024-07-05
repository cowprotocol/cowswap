import React, { useState, createRef } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media } from '@cowprotocol/ui'

import IMAGE_CARRET_DOWN from 'assets/img/carret-down.svg'
import { MenuFlyout, Content, MenuSection, MenuTitle, ButtonMenuItem } from 'components/common/MenuDropdown/styled'
import useOnClickOutside from 'hooks/useOnClickOutside'
import SVG from 'react-inlinesvg'

import InternalExternalMenuLink from './InternalExternalLink'
import { MenuTreeProps } from './MenuTree'
import { DropDownItem, MenuItemKind } from './types'

interface MenuProps {
  title: string
  children: React.ReactNode
  isMobileMenuOpen?: boolean
  showDropdown?: boolean
  url?: string
}

export function MenuItemsPanel({ title, children }: MenuProps): React.ReactNode {
  const isLargeAndUp = useMediaQuery(Media.LargeAndUp(false))
  const node = createRef<HTMLOListElement>()
  const [showMenu, setShowMenu] = useState(false)

  const handleOnClick = (): void => {
    setShowMenu((showMenu) => !showMenu)
  }

  useOnClickOutside(node, () => isLargeAndUp && setShowMenu(false)) // only trigger on large screens

  return (
    <MenuFlyout ref={node as never}>
      <ButtonMenuItem onClick={handleOnClick} className={showMenu ? 'expanded' : ''}>
        {title} <SVG src={IMAGE_CARRET_DOWN} description="dropdown icon" className={showMenu ? 'expanded' : ''} />
      </ButtonMenuItem>
      {showMenu && <Content onClick={handleOnClick}>{children}</Content>}
    </MenuFlyout>
  )
}

export interface DropdownProps {
  menuItem: DropDownItem
  context: Omit<MenuTreeProps, 'menuList' | 'isMobile'>
}

export const DropDown = ({ menuItem, context }: DropdownProps): React.ReactNode => {
  const { isMobileMenuOpen, handleMobileMenuOnClick } = context

  return (
    <MenuItemsPanel
      title={menuItem.title}
      key={menuItem.title}
      isMobileMenuOpen={isMobileMenuOpen}
      showDropdown={menuItem.kind === MenuItemKind.DROP_DOWN}
    >
      {menuItem.items.map((item, index) => {
        const { sectionTitle, links } = item
        return (
          <MenuSection key={index}>
            {sectionTitle && <MenuTitle>{sectionTitle}</MenuTitle>}
            {links.map((link, linkIndex) => (
              <InternalExternalMenuLink key={linkIndex} link={link} handleMobileMenuOnClick={handleMobileMenuOnClick} />
            ))}
          </MenuSection>
        )
      })}
    </MenuItemsPanel>
  )
}

export default DropDown
