import { Command } from '@cowprotocol/types'

import { MAIN_MENU } from 'components/common/MenuDropdown/mainMenu'
import MobileMenuIcon from 'components/common/MenuDropdown/MobileMenuIcon'
import { Wrapper, MenuContainer, AnchorMenuLink } from 'components/common/MenuDropdown/styled'
import { MenuItemKind, MenuTreeItem } from 'components/common/MenuDropdown/types'

import DropDown from '.'

interface MenuItemWithDropDownProps {
  menuItem: MenuTreeItem
  context: MenuTreeProps
}

function MenuItemWithDropDown(props: MenuItemWithDropDownProps): React.ReactNode | null {
  const { menuItem, context } = props

  switch (menuItem.kind) {
    case MenuItemKind.DROP_DOWN:
      return <DropDown menuItem={menuItem} context={context} />

    case undefined: // INTERNAL
    case MenuItemKind.EXTERNAL_LINK: // EXTERNAL
      // Render Internal/External links
      return <AnchorMenuLink link={menuItem} handleMobileMenuOnClick={context.handleMobileMenuOnClick} />
    default:
      return null
  }
}

export interface MenuTreeProps {
  isMobileMenuOpen: boolean
  handleMobileMenuOnClick: Command
  menuList?: MenuTreeItem[]
  isMobile?: boolean
}

export function MenuTree(props: MenuTreeProps): React.ReactNode {
  const { isMobileMenuOpen, handleMobileMenuOnClick, isMobile, menuList = MAIN_MENU } = props
  return (
    <Wrapper isMobileMenuOpen={isMobileMenuOpen}>
      <MenuContainer className={isMobileMenuOpen ? 'mobile-menu' : ''}>
        {menuList.map((menuItem, index) => (
          <MenuItemWithDropDown key={index} menuItem={menuItem} context={props} />
        ))}
      </MenuContainer>
      {isMobile && <MobileMenuIcon isMobileMenuOpen={isMobileMenuOpen} onClick={handleMobileMenuOnClick} />}
    </Wrapper>
  )
}
