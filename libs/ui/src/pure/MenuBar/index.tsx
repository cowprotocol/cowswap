import React, { useState, useRef } from 'react'
import styled from 'styled-components/macro'

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
} from './styled'

import SVG from 'react-inlinesvg'
import { UI, Logo, LOGO_MAP } from '@cowprotocol/ui'
import { useOnClickOutside } from '@cowprotocol/common-hooks'
import IMG_ICON_MENU_DOTS from '@cowprotocol/assets/images/menu-grid-dots.svg'
import IMG_ICON_ARROW_RIGHT from '@cowprotocol/assets/images/arrow-right.svg'
import IMG_ICON_CARRET_DOWN from '@cowprotocol/assets/images/carret-down.svg'
import IMG_ICON_SETTINGS_GLOBAL from '@cowprotocol/assets/images/settings-global.svg'

const DAO_NAV_ITEMS: MenuItem[] = [
  { href: 'https://cow.fi/#cowswap', logoVariant: 'cowSwap' },
  { href: 'https://cow.fi/#cowprotocol', logoVariant: 'cowSwap' },
  { href: 'https://cow.fi/#cowamm', logoVariant: 'cowProtocol' },
  { href: 'https://cow.fi/#mevblocker', logoVariant: 'cowProtocol' },
]

const SETTINGS_ITEMS = [
  { label: 'Preferences', href: '#preferences' },
  { label: 'Account Settings', href: '#account-settings' },
  { label: 'Theme', href: '#theme' },
]

interface NavItemProps {
  item: MenuItem
}

export interface MenuItem {
  href?: string
  label?: string
  type?: 'dropdown'
  children?: DropdownMenuItem[]
  logoVariant?: keyof typeof LOGO_MAP // Optional logo variant
  icon?: string // Path to the icon image
}

interface MenuBarProps {
  navItems: MenuItem[]
  theme: 'light' | 'dark'
  productVariant: keyof typeof LOGO_MAP // e.g., 'cowSwap', 'cowProtocol', etc.
}

interface DropdownMenuItem {
  href?: string
  label?: string // Update this line
  icon?: string
  description?: string
  isButton?: boolean
  children?: DropdownMenuItem[]
  logoVariant?: keyof typeof LOGO_MAP
}

interface DropdownMenuContent {
  title: string | undefined
  items?: DropdownMenuItem[]
}

// General root nav item
const NavItem = ({ item, isClickable = false }: NavItemProps & { isClickable?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false)
  const handleToggle = () => setIsOpen((prevIsOpen) => !prevIsOpen)

  return (
    <>
      {/* If children are present, render a dropdown */}
      {item.children ? (
        <GenericDropdown
          isOpen={isOpen}
          content={{
            title: item.label,
            items: item.children,
          }}
          onTrigger={handleToggle}
          interaction={isClickable ? 'click' : 'hover'}
        />
      ) : (
        // If no children are present, render a simple nav item
        <RootNavItem href={item.href}>{item.label}</RootNavItem>
      )}
    </>
  )
}

const DropdownContentItem: React.FC<{ item: DropdownMenuItem; theme: 'light' | 'dark' }> = ({ item, theme }) => {
  const [isChildrenVisible, setIsChildrenVisible] = useState(false)

  const handleToggleChildrenVisibility = (event: React.MouseEvent) => {
    // Prevent the link from navigating
    event.preventDefault()
    // Stop the event from propagating further
    event.stopPropagation()
    // Toggle the visibility of the children
    setIsChildrenVisible(!isChildrenVisible)
  }

  // First check if the item has children and handle that case
  if (item.children) {
    // If children are present, render a nested dropdown (3rd level)
    return (
      <StyledDropdownContentItem onClick={handleToggleChildrenVisibility}>
        <DropdownContentItemText>
          <DropdownContentItemTitle>{item.label}</DropdownContentItemTitle>
          {item.description && <DropdownContentItemDescription>{item.description}</DropdownContentItemDescription>}
        </DropdownContentItemText>
        {isChildrenVisible && (
          <DropdownContentWrapper isThirdLevel content={{ title: undefined, items: item.children }} />
        )}
        <SVG src={isChildrenVisible ? IMG_ICON_CARRET_DOWN : IMG_ICON_ARROW_RIGHT} />
      </StyledDropdownContentItem>
    )
  }

  // Handling for items with a logo variant
  if (item.logoVariant) {
    return (
      <StyledDropdownContentItem href={item.href}>
        <Logo product={item.logoVariant} themeMode={theme} />
        {item.label && <span>{item.label}</span>}
        <SVG src={IMG_ICON_ARROW_RIGHT} />
      </StyledDropdownContentItem>
    )
  }

  // Handling for items with an icon
  if (item.icon) {
    return (
      <StyledDropdownContentItem href={item.href}>
        <DropdownContentItemImage>
          <img src={item.icon} alt={item.label} style={{ width: '100%', height: '100%' }} />
        </DropdownContentItemImage>
        {item.label && <span>{item.label}</span>}
        <SVG src={IMG_ICON_ARROW_RIGHT} />
      </StyledDropdownContentItem>
    )
  }

  // Handling for button items
  if (item.isButton) {
    return <DropdownContentItemButton onClick={(e) => e.preventDefault()}>{item.label}</DropdownContentItemButton>
  }

  // If no logo, icon, or children are provided, handle case differently
  return null
}

const NavDaoTrigger: React.FC<{
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  theme: 'light' | 'dark'
}> = ({ isOpen, setIsOpen, theme }) => {
  const triggerRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(triggerRef, () => setIsOpen(false))

  return (
    <>
      <NavDaoTriggerElement ref={triggerRef} isActive={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <SVG src={IMG_ICON_MENU_DOTS} />
      </NavDaoTriggerElement>
      {isOpen && (
        <DropdownContent isOpen={true}>
          {DAO_NAV_ITEMS.map((item, index) => (
            <DropdownContentItem key={index} item={item} theme={theme} />
          ))}
        </DropdownContent>
      )}
    </>
  )
}

interface DropdownProps {
  isOpen: boolean
  content: DropdownMenuContent
  onTrigger: () => void
  interaction: 'hover' | 'click'
}

// Root nav item with a dropdown
const GenericDropdown: React.FC<DropdownProps> = ({ isOpen, content, onTrigger, interaction }) => {
  if (!content.title) {
    // Handle the case where the title is missing
    throw new Error('Dropdown content must have a title')
  }

  // This component uses onMouseEnter and onMouseLeave for hover, onClick for click
  const interactionProps =
    interaction === 'hover' ? { onMouseEnter: onTrigger, onMouseLeave: onTrigger } : { onClick: onTrigger }

  return (
    <DropdownMenu {...interactionProps}>
      {/* Render the root nav item that triggers the dropdown */}
      <RootNavItem as="button" aria-haspopup="true" aria-expanded={isOpen} isOpen={isOpen}>
        <span>{content.title}</span>
        {content.items && <SVG src={IMG_ICON_CARRET_DOWN} />}
      </RootNavItem>
      {isOpen && <DropdownContentWrapper content={content} />}
    </DropdownMenu>
  )
}

const DropdownContentWrapper: React.FC<{
  content: DropdownMenuContent
  isThirdLevel?: boolean
  isVisible?: boolean
}> = ({ content, isThirdLevel, isVisible = true }) => {
  const [isThirdLevelVisible, setIsThirdLevelVisible] = useState(false)

  const handleToggleThirdLevelVisibility = (event: React.MouseEvent) => {
    event.preventDefault() // Prevent default navigation
    event.stopPropagation() // Stop propagation to avoid closing dropdown accidentally
    setIsThirdLevelVisible((prevVisible) => !prevVisible) // Toggle third level visibility
    console.log('Third level visibility:', !isThirdLevelVisible) // Debug log
  }

  return (
    <DropdownContent isOpen={isVisible} isThirdLevel={isThirdLevel}>
      {content.items?.map((item, index) => (
        <StyledDropdownContentItem
          key={index}
          onClick={item.children ? handleToggleThirdLevelVisibility : undefined}
          href={item.href}
        >
          {item.icon && <DropdownContentItemIcon src={item.icon} alt="" />}
          <DropdownContentItemText>
            <DropdownContentItemTitle>{item.label}</DropdownContentItemTitle>
            {item.description && <DropdownContentItemDescription>{item.description}</DropdownContentItemDescription>}
          </DropdownContentItemText>
          <SVG src={IMG_ICON_ARROW_RIGHT} />
          {item.children && isThirdLevelVisible && (
            <DropdownContentWrapper
              content={{ title: undefined, items: item.children }}
              isThirdLevel
              isVisible={isThirdLevelVisible}
            />
          )}
        </StyledDropdownContentItem>
      ))}
    </DropdownContent>
  )
}

const GlobalSettingsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useOnClickOutside(buttonRef, () => setIsOpen(false))

  return (
    <GlobalSettingsWrapper>
      <GlobalSettingsButton ref={buttonRef} onClick={() => setIsOpen(!isOpen)}>
        <SVG src={IMG_ICON_SETTINGS_GLOBAL} />
      </GlobalSettingsButton>
      {isOpen && (
        <DropdownContent isOpen={true} alignRight>
          {SETTINGS_ITEMS.map((item, index) => (
            <StyledDropdownContentItem key={index} href={item.href}>
              <DropdownContentItemText>
                <DropdownContentItemTitle>{item.label}</DropdownContentItemTitle>
              </DropdownContentItemText>
              <SVG src={IMG_ICON_ARROW_RIGHT} />
            </StyledDropdownContentItem>
          ))}
        </DropdownContent>
      )}
    </GlobalSettingsWrapper>
  )
}

export const MenuBar = ({ navItems, theme, productVariant }: MenuBarProps) => {
  const [isDaoOpen, setDaoOpen] = useState(false)
  const menuRef = useRef(null)

  useOnClickOutside(menuRef, () => setDaoOpen(false))

  return (
    <MenuBarWrapper ref={menuRef}>
      <MenuBarInner themeMode={theme}>
        <NavDaoTrigger isOpen={isDaoOpen} setIsOpen={setDaoOpen} theme={theme} />
        <Logo product={productVariant} themeMode={theme} />
        <NavItems>
          {navItems.map((item, index) => (
            <NavItem key={index} item={item} />
          ))}
        </NavItems>
        <RightAligned>
          <GlobalSettingsDropdown />
        </RightAligned>
      </MenuBarInner>
    </MenuBarWrapper>
  )
}
