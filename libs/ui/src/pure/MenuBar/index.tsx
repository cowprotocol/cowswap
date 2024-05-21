import React, { useState, useRef, RefObject } from 'react'
import { upToLarge, useMediaQuery } from '../../../../../apps/cowswap-frontend/src/legacy/hooks/useMediaQuery'
import {
  RootNavItem,
  MenuBarWrapper,
  MenuBarInner,
  NavDaoTriggerElement,
  DropdownMenu,
  DropdownContent,
  DropdownContentItemButton,
  DropdownContentItemImage,
  DropdownContentItemIcon,
  DropdownContentItemText,
  DropdownContentItemTitle,
  DropdownContentItemDescription,
  GlobalSettingsWrapper,
  GlobalSettingsButton,
  NavItems,
  StyledDropdownContentItem,
  RightAligned,
  MobileMenuTrigger,
} from './styled'
import SVG from 'react-inlinesvg'
import { ProductLogo, ProductVariant, themeMapper } from '@cowprotocol/ui'
import { useOnClickOutside } from '@cowprotocol/common-hooks'
import IMG_ICON_MENU_DOTS from '@cowprotocol/assets/images/menu-grid-dots.svg'
import IMG_ICON_ARROW_RIGHT from '@cowprotocol/assets/images/arrow-right.svg'
import IMG_ICON_CARRET_DOWN from '@cowprotocol/assets/images/carret-down.svg'
import IMG_ICON_SETTINGS_GLOBAL from '@cowprotocol/assets/images/settings-global.svg'
import IMG_ICON_MENU_HAMBURGER from '@cowprotocol/assets/images/menu-hamburger.svg'
import IMG_ICON_X from '@cowprotocol/assets/images/x.svg'

import { addBodyClass, removeBodyClass } from '@cowprotocol/common-utils'
import { CowSwapTheme } from '@cowprotocol/widget-lib'
import { ThemeProvider, DefaultTheme } from 'styled-components'

// NavItem Component: Handles individual navigation items, toggles dropdowns based on presence of children.
// DropdownContentItem Component: Renders items within dropdowns, constructs logo variants based on the theme.
// NavDaoTrigger Component: Manages the DAO menu trigger and its dropdown content.
// GenericDropdown Component: Used for dropdowns in navigation items, determines hover or click interaction.
// DropdownContentWrapper Component: Manages nested dropdown content, including third-level items.
// GlobalSettingsDropdown Component: Handles the global settings dropdown menu.
// MenuBar Component: Main component managing the menu bar, handles mobile and desktop modes, toggles no-scroll class based on menu state.

const DAO_NAV_ITEMS: MenuItem[] = [
  { href: 'https://cow.fi/#cowswap', productVariant: ProductVariant.CowSwap },
  { href: 'https://cow.fi/#cowprotocol', productVariant: ProductVariant.CowProtocol },
  { href: 'https://cow.fi/#cowamm', productVariant: ProductVariant.CowAmm },
  { href: 'https://cow.fi/', productVariant: ProductVariant.CowDao },
]

const SETTINGS_ITEMS: MenuItem[] = [
  { label: 'Preferences', href: 'https://google.com/' },
  { label: 'Account Settings', href: 'https://cow.fi/' },
  { label: 'Theme', href: '#theme' },
  { label: 'Language', href: '#language' },
]

// Type definitions for navigation items
interface NavItemProps {
  item: MenuItem
}

export interface MenuItem {
  href?: string
  label?: string
  type?: 'dropdown'
  children?: DropdownMenuItem[]
  productVariant?: ProductVariant
  icon?: string
  isButton?: boolean
}

interface MenuBarProps {
  navItems: MenuItem[]
  theme: CowSwapTheme
  productVariant: ProductVariant
  additionalContent?: React.ReactNode
}

interface DropdownMenuItem {
  href?: string
  label?: string
  icon?: string
  description?: string
  isButton?: boolean
  children?: DropdownMenuItem[]
  productVariant?: ProductVariant
}

interface DropdownMenuContent {
  title: string | undefined
  items?: DropdownMenuItem[]
}

interface DropdownProps {
  isOpen: boolean
  content: DropdownMenuContent
  onTrigger: () => void
  interaction: 'hover' | 'click'
}

// Component for individual navigation items
const NavItem = ({
  item,
  isClickable = false,
  mobileMode = false,
}: NavItemProps & { isClickable?: boolean; mobileMode?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false)
  const handleToggle = () => setIsOpen((prevIsOpen) => !prevIsOpen)

  return item.children ? (
    <GenericDropdown
      isOpen={isOpen}
      content={{ title: item.label, items: item.children }}
      onTrigger={handleToggle}
      interaction={isClickable || mobileMode ? 'click' : 'hover'}
      mobileMode={mobileMode}
      isNavItemDropdown={true} // Indicate this is a NavItem dropdown
    />
  ) : (
    <RootNavItem href={item.href} mobileMode={mobileMode}>
      {item.label}
    </RootNavItem>
  )
}

// Component for items within dropdowns
const DropdownContentItem: React.FC<{ item: DropdownMenuItem; theme: CowSwapTheme; closeMenu: () => void }> = ({
  item,
  theme,
  closeMenu,
}) => {
  const [isChildrenVisible, setIsChildrenVisible] = useState(false)

  const handleToggleChildrenVisibility = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsChildrenVisible(!isChildrenVisible)
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!item.children) {
      closeMenu()
    } else {
      e.preventDefault()
    }
  }

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    closeMenu()
  }

  const renderLinkItem = (content: React.ReactNode, href?: string) => (
    <StyledDropdownContentItem as="a" href={href} onClick={handleLinkClick} isOpen={isChildrenVisible}>
      {content}
      {!item.children && <SVG src={IMG_ICON_ARROW_RIGHT} className="arrow-icon-right" />}
    </StyledDropdownContentItem>
  )

  const renderItemContent = () => {
    const { productVariant, icon, label, description } = item
    return (
      <>
        {productVariant ? (
          <ProductLogo variant={productVariant} theme={theme} logoIconOnly={false} />
        ) : icon ? (
          <DropdownContentItemImage>
            <img src={icon} alt={label} />
          </DropdownContentItemImage>
        ) : null}
        <DropdownContentItemText>
          <DropdownContentItemTitle>{label}</DropdownContentItemTitle>
          {description && <DropdownContentItemDescription>{description}</DropdownContentItemDescription>}
        </DropdownContentItemText>
      </>
    )
  }

  return item.children ? (
    <>
      <StyledDropdownContentItem as="div" onClick={handleToggleChildrenVisibility} isOpen={isChildrenVisible}>
        {renderItemContent()}
        <SVG src={IMG_ICON_CARRET_DOWN} />
      </StyledDropdownContentItem>
      {isChildrenVisible && (
        <DropdownContentWrapper isThirdLevel content={{ title: undefined, items: item.children }} mobileMode={true} />
      )}
    </>
  ) : item.isButton ? (
    <DropdownContentItemButton onClick={handleButtonClick}>
      {renderItemContent()}
      {!item.children && <SVG src={IMG_ICON_ARROW_RIGHT} className="arrow-icon-right" />}
    </DropdownContentItemButton>
  ) : (
    renderLinkItem(renderItemContent(), item.href)
  )
}

// Component for the DAO menu trigger
const NavDaoTrigger: React.FC<{
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  theme: CowSwapTheme
  mobileMode: boolean
}> = ({ isOpen, setIsOpen, theme, mobileMode }) => {
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useOnClickOutside([triggerRef as RefObject<HTMLElement>, dropdownRef as RefObject<HTMLElement>], () =>
    setIsOpen(false)
  )

  const closeMenu = () => setIsOpen(false)

  return (
    <>
      <NavDaoTriggerElement ref={triggerRef} isActive={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <SVG src={IMG_ICON_MENU_DOTS} />
      </NavDaoTriggerElement>
      {isOpen && (
        <DropdownContent isOpen={true} ref={dropdownRef} mobileMode={mobileMode}>
          {DAO_NAV_ITEMS.map((item, index) => (
            <DropdownContentItem key={index} item={item} theme={theme} closeMenu={closeMenu} />
          ))}
        </DropdownContent>
      )}
    </>
  )
}

// Generic dropdown component used for NavItem dropdowns
const GenericDropdown: React.FC<DropdownProps & { mobileMode?: boolean; isNavItemDropdown?: boolean }> = ({
  isOpen,
  content,
  onTrigger,
  interaction,
  mobileMode,
  isNavItemDropdown,
}) => {
  if (!content.title) {
    throw new Error('Dropdown content must have a title')
  }

  const interactionProps =
    interaction === 'hover' ? { onMouseEnter: onTrigger, onMouseLeave: onTrigger } : { onClick: onTrigger }

  return (
    <DropdownMenu {...interactionProps} mobileMode={mobileMode}>
      <RootNavItem as="button" aria-haspopup="true" aria-expanded={isOpen} isOpen={isOpen} mobileMode={mobileMode}>
        <span>{content.title}</span>
        {content.items && <SVG src={IMG_ICON_CARRET_DOWN} />}
      </RootNavItem>
      {isOpen && (
        <DropdownContentWrapper content={content} mobileMode={mobileMode} isNavItemDropdown={isNavItemDropdown} />
      )}
    </DropdownMenu>
  )
}

// Wrapper component for dropdown content, handling nested dropdowns
const DropdownContentWrapper: React.FC<{
  content: DropdownMenuContent
  isThirdLevel?: boolean
  isVisible?: boolean
  mobileMode?: boolean
  isNavItemDropdown?: boolean
}> = ({ content, isThirdLevel = false, isVisible = true, mobileMode = false, isNavItemDropdown = false }) => {
  const [isThirdLevelVisible, setIsThirdLevelVisible] = useState(false)

  const handleToggleThirdLevelVisibility = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsThirdLevelVisible((prevVisible) => !prevVisible)
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Allow default behavior for anchor elements
    e.stopPropagation() // Prevent the click event from propagating to the outside click handler
  }

  return (
    <DropdownContent
      isOpen={isVisible}
      isThirdLevel={isThirdLevel}
      mobileMode={mobileMode}
      isNavItemDropdown={isNavItemDropdown}
    >
      {content.items?.map((item, index) => {
        const hasChildren = !!item.children
        const Tag = hasChildren ? 'div' : 'a'
        return (
          <StyledDropdownContentItem
            key={index}
            href={!hasChildren ? item.href : undefined} // Set href only for items without children
            isOpen={isThirdLevelVisible}
            as={Tag}
            onClick={(e: React.MouseEvent<HTMLDivElement | HTMLAnchorElement>) => {
              if (hasChildren) {
                handleToggleThirdLevelVisibility(e as React.MouseEvent<HTMLDivElement>)
              } else {
                handleLinkClick(e as React.MouseEvent<HTMLAnchorElement>)
              }
            }}
          >
            {item.icon && <DropdownContentItemIcon src={item.icon} alt="" />}
            <DropdownContentItemText>
              <DropdownContentItemTitle>{item.label}</DropdownContentItemTitle>
              {item.description && <DropdownContentItemDescription>{item.description}</DropdownContentItemDescription>}
            </DropdownContentItemText>
            {item.children && <SVG src={IMG_ICON_CARRET_DOWN} />}
            {!item.children && <SVG src={IMG_ICON_ARROW_RIGHT} className="arrow-icon-right" />}
            {item.children && isThirdLevelVisible && (
              <DropdownContentWrapper
                content={{ title: undefined, items: item.children }}
                isThirdLevel
                isVisible={isThirdLevelVisible}
                mobileMode={mobileMode}
                isNavItemDropdown={isNavItemDropdown}
              />
            )}
          </StyledDropdownContentItem>
        )
      })}
    </DropdownContent>
  )
}

// Component for the global settings dropdown
const GlobalSettingsDropdown = ({ mobileMode }: { mobileMode: boolean }) => {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useOnClickOutside([buttonRef as RefObject<HTMLElement>, dropdownRef as RefObject<HTMLElement>], () =>
    setIsOpen(false)
  )

  return (
    <GlobalSettingsWrapper>
      <GlobalSettingsButton ref={buttonRef} onClick={() => setIsOpen(!isOpen)}>
        <SVG src={IMG_ICON_SETTINGS_GLOBAL} />
      </GlobalSettingsButton>
      {isOpen && (
        <DropdownContent isOpen={true} ref={dropdownRef} alignRight mobileMode={mobileMode}>
          {SETTINGS_ITEMS.map((item, index) => (
            <StyledDropdownContentItem key={index} href={item.href}>
              <DropdownContentItemText>
                <DropdownContentItemTitle>{item.label}</DropdownContentItemTitle>
              </DropdownContentItemText>
              <SVG src={IMG_ICON_ARROW_RIGHT} className="arrow-icon-right" />
            </StyledDropdownContentItem>
          ))}
        </DropdownContent>
      )}
    </GlobalSettingsWrapper>
  )
}

// Main MenuBar component
export const MenuBar = (props: MenuBarProps) => {
  const { navItems, theme, productVariant: productVariant, additionalContent } = props
  const [isDaoOpen, setIsDaoOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const mobileMenuRef = useRef(null)

  useOnClickOutside([menuRef as RefObject<HTMLElement>], () => setIsDaoOpen(false))
  useOnClickOutside([mobileMenuRef as RefObject<HTMLElement>], () => setIsMobileMenuOpen(false))

  const isMobile = useMediaQuery(upToLarge)

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen((prevState) => !prevState)
  }

  // Add/remove noScroll class to body when mobile menu is opened/closed
  React.useEffect(() => {
    if (isMobile) {
      if (isMobileMenuOpen || isDaoOpen) {
        addBodyClass('noScroll')
      } else {
        removeBodyClass('noScroll')
      }
    }

    return () => {
      removeBodyClass('noScroll')
    }
  }, [isMobile, isMobileMenuOpen, isDaoOpen])

  return (
    <ThemeProvider theme={themeMapper(theme)}>
      <MenuBarWrapper ref={menuRef}>
        <MenuBarInner theme={theme}>
          <NavDaoTrigger isOpen={isDaoOpen} setIsOpen={setIsDaoOpen} theme={theme} mobileMode={isMobile} />
          <ProductLogo variant={productVariant} theme={theme} logoIconOnly={isMobile} />

          {/* Only render NavItems if the screen size is large */}
          {!isMobile && (
            <NavItems theme={theme}>
              {navItems.map((item, index) => (
                <NavItem key={index} item={item} mobileMode={isMobile} />
              ))}
            </NavItems>
          )}

          {/* Always show GlobalSettingsDropdown and MobileMenuTrigger */}
          <RightAligned>
            {!isMobile && additionalContent}

            {isMobile && (
              <MobileMenuTrigger theme={theme} onClick={handleMobileMenuToggle}>
                <SVG src={isMobileMenuOpen ? IMG_ICON_X : IMG_ICON_MENU_HAMBURGER} />
              </MobileMenuTrigger>
            )}
            <GlobalSettingsDropdown mobileMode={isMobile} />
          </RightAligned>
        </MenuBarInner>

        {/* Mobile Menu */}
        {isMobile && isMobileMenuOpen && (
          <NavItems mobileMode={isMobile} ref={mobileMenuRef} theme={theme}>
            <div>
              {navItems.map((item, index) => (
                <NavItem key={index} item={item} mobileMode={isMobile} />
              ))}
              {/* Render additional content within the NavItems in mobile view */}
              {additionalContent}
            </div>
          </NavItems>
        )}
      </MenuBarWrapper>
    </ThemeProvider>
  )
}
