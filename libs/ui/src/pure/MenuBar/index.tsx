import React, { useState, useEffect, useRef } from 'react'
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
import { Logo, LOGO_MAP } from '@cowprotocol/ui'
import { useOnClickOutside } from '@cowprotocol/common-hooks'
import IMG_ICON_MENU_DOTS from '@cowprotocol/assets/images/menu-grid-dots.svg'
import IMG_ICON_ARROW_RIGHT from '@cowprotocol/assets/images/arrow-right.svg'
import IMG_ICON_CARRET_DOWN from '@cowprotocol/assets/images/carret-down.svg'
import IMG_ICON_SETTINGS_GLOBAL from '@cowprotocol/assets/images/settings-global.svg'

const DAO_NAV_ITEMS: MenuItem[] = [
  { href: 'https://cow.fi/#cowswap', logoVariant: 'cowSwap' },
  { href: 'https://cow.fi/#cowprotocol', logoVariant: 'cowSwap' },
  { href: 'https://cow.fi/#cowamm', logoVariant: 'cowProtocol' },
  { href: 'https://cow.fi/', logoVariant: 'cowProtocol' },
]

const SETTINGS_ITEMS: MenuItem[] = [
  { label: 'Preferences', href: '#preferences' },
  { label: 'Account Settings', href: '#account-settings' },
  { label: 'Theme', href: '#theme' },
  { label: 'Language', href: '#language' },
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
  isButton?: boolean
}

interface MenuBarProps {
  navItems: MenuItem[]
  theme: 'light' | 'dark'
  productVariant: keyof typeof LOGO_MAP // e.g., 'cowSwap', 'cowProtocol', etc.
}

interface DropdownMenuItem {
  href?: string
  label?: string
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
      {item.children ? (
        <GenericDropdown
          isOpen={isOpen}
          content={{ title: item.label, items: item.children }}
          onTrigger={handleToggle}
          interaction={isClickable ? 'click' : 'hover'}
        />
      ) : (
        <RootNavItem href={item.href}>{item.label}</RootNavItem>
      )}
    </>
  )
}

const DropdownContentItem: React.FC<{ item: DropdownMenuItem; theme: 'light' | 'dark'; closeMenu: () => void }> = ({
  item,
  theme,
  closeMenu,
}) => {
  const [isChildrenVisible, setIsChildrenVisible] = useState(false)

  const handleToggleChildrenVisibility = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    console.log('Clicked item to toggle visibility')
    event.preventDefault()
    event.stopPropagation()
    setIsChildrenVisible(!isChildrenVisible)
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Clicked button')
    e.preventDefault()
    closeMenu()
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    console.log('Clicked link')
    closeMenu()
  }

  const renderLinkItem = (content: React.ReactNode, href?: string) => (
    <StyledDropdownContentItem as="a" href={href} onClick={handleLinkClick}>
      {content}
      <SVG src={IMG_ICON_ARROW_RIGHT} />
    </StyledDropdownContentItem>
  )

  const renderButtonItem = (content: React.ReactNode) => (
    <StyledDropdownContentItem as="button" onClick={handleClick}>
      {content}
    </StyledDropdownContentItem>
  )

  const renderNestedDropdown = () => (
    <>
      <StyledDropdownContentItem as="div" onClick={handleToggleChildrenVisibility}>
        {renderContentItemText()}
        {renderIcon(isChildrenVisible ? IMG_ICON_CARRET_DOWN : IMG_ICON_ARROW_RIGHT)}
      </StyledDropdownContentItem>
      {isChildrenVisible && (
        <DropdownContentWrapper isThirdLevel content={{ title: undefined, items: item.children }} />
      )}
    </>
  )

  const renderContentItemText = () => (
    <DropdownContentItemText>
      <DropdownContentItemTitle>{item.label}</DropdownContentItemTitle>
      {item.description && <DropdownContentItemDescription>{item.description}</DropdownContentItemDescription>}
    </DropdownContentItemText>
  )

  const renderIcon = (src: string) => <SVG src={src} />

  const renderLogoVariant = () => {
    const logoVariant = item.logoVariant || 'cowSwapLightMode'
    return renderLinkItem(
      <>
        <Logo product={logoVariant as keyof typeof LOGO_MAP} themeMode={theme} />
        {item.label && <span>{item.label}</span>}
      </>,
      item.href
    )
  }

  const renderIconItem = () =>
    renderLinkItem(
      <>
        <DropdownContentItemImage>
          <img src={item.icon} alt={item.label} style={{ width: '100%', height: '100%' }} />
        </DropdownContentItemImage>
        {item.label && <span>{item.label}</span>}
      </>,
      item.href
    )

  const renderButtonItemContent = () => (
    <DropdownContentItemButton onClick={handleClick}>{item.label}</DropdownContentItemButton>
  )

  if (item.children) return renderNestedDropdown()
  if (item.logoVariant) return renderLogoVariant()
  if (item.icon) return renderIconItem()
  if (item.isButton) return renderButtonItem(renderButtonItemContent())

  return renderLinkItem(renderContentItemText(), item.href)
}

const NavDaoTrigger: React.FC<{
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  theme: 'light' | 'dark'
}> = ({ isOpen, setIsOpen, theme }) => {
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = (event: MouseEvent) => {
    if (
      triggerRef.current &&
      !triggerRef.current.contains(event.target as Node) &&
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const closeMenu = () => setIsOpen(false)

  return (
    <>
      <NavDaoTriggerElement ref={triggerRef} isActive={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <SVG src={IMG_ICON_MENU_DOTS} />
      </NavDaoTriggerElement>
      {isOpen && (
        <DropdownContent isOpen={true} ref={dropdownRef}>
          {DAO_NAV_ITEMS.map((item, index) => (
            <DropdownContentItem key={index} item={item} theme={theme} closeMenu={closeMenu} />
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
    throw new Error('Dropdown content must have a title')
  }

  const interactionProps =
    interaction === 'hover' ? { onMouseEnter: onTrigger, onMouseLeave: onTrigger } : { onClick: onTrigger }

  return (
    <DropdownMenu {...interactionProps}>
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
}> = ({ content, isThirdLevel = false, isVisible = true }) => {
  const [isThirdLevelVisible, setIsThirdLevelVisible] = useState(false)

  const handleToggleThirdLevelVisibility = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setIsThirdLevelVisible((prevVisible) => !prevVisible)
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
  const [isDaoOpen, setIsDaoOpen] = useState(false)
  const menuRef = useRef(null)

  useOnClickOutside(menuRef, () => setIsDaoOpen(false))

  const validProductVariant = (productVariant || 'cowSwapLightMode') as keyof typeof LOGO_MAP

  return (
    <MenuBarWrapper ref={menuRef}>
      <MenuBarInner themeMode={theme}>
        <NavDaoTrigger isOpen={isDaoOpen} setIsOpen={setIsDaoOpen} theme={theme} />
        <Logo product={validProductVariant} themeMode={theme} />
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