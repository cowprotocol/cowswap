import React, { useState, useRef } from 'react'
import styled from 'styled-components/macro'
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
  { href: 'https://cow.fi/#mevblocker', logoVariant: 'cowProtocol' },
]

const SETTINGS_ITEMS = [
  { label: 'Preferences', href: '#preferences' },
  { label: 'Account Settings', href: '#account-settings' },
  { label: 'Theme', href: '#theme' },
]

const MenuBarWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 10px;
  z-index: 10;

  // temporary
  position: sticky;
  top: 0;
`

const MenuBarInner = styled.div<{ themeMode: string }>`
  --height: 56px;
  --width: 100%;
  --bgColor: rgba(255, 248, 247, 0.6);
  --bgColor: ${({ themeMode }) => (themeMode === 'dark' ? '#333' : 'rgba(255, 248, 247, 0.6)')};
  --borderRadius: 28px;
  --blur: 16px;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 8px 4px;
  gap: 16px;
  height: var(--height);
  width: var(--width);
  background: var(--bgColor);
  backdrop-filter: blur(var(--blur));
  border-radius: var(--borderRadius);
`

interface NavDaoTriggerElementProps {
  isActive: boolean
}

const NavDaoTriggerElement = styled.div<NavDaoTriggerElementProps>`
  --size: 42px;
  --defaultFill: grey;
  --activeBackground: #555; // Active background color
  --activeFill: #fff; // Active fill color

  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  gap: 16px;
  height: var(--size);
  width: var(--size);
  border-radius: 50%;
  background: ${({ isActive }) => (isActive ? 'var(--activeBackground)' : 'transparent')};
  color: ${({ isActive }) => (isActive ? 'var(--activeFill)' : 'var(--defaultFill)')};
  cursor: pointer;
  transition: background 0.2s, fill 0.2s;

  &:hover {
    background: var(--activeBackground);
    color: ${({ isActive }) => (isActive ? 'var(--activeFill)' : 'var(--defaultFill)')};
  }

  > svg {
    --size: 65%;
    height: var(--size);
    width: var(--size);
    object-fit: contain;
    color: currentColor;
    margin: auto;
  }

  > svg path {
    fill: currentColor;
  }
`

const NavItems = styled.ul`
  --marginLeft: 20px;

  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: center;
  gap: 4px;
  list-style-type: none;
  margin: 0 auto 0 var(--marginLeft);
  padding: 0;
`

const DropdownContent = styled.div<{ isOpen: boolean; alignRight?: boolean }>`
  --dropdownOffset: 12px;
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  position: absolute;
  background: rgba(255, 248, 247, 1);
  backdrop-filter: blur(15px);
  z-index: 1000;
  top: calc(100% + var(--dropdownOffset));
  right: ${({ alignRight }) => (alignRight ? 0 : 'initial')};
  left: ${({ alignRight }) => (alignRight ? 'initial' : 0)};
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 4px;
  position: absolute;
  min-width: 300px;
  width: max-content;
  max-width: 530px;
  height: auto;
  border-radius: 28px;

  &::before {
    content: '';
    position: absolute;
    top: calc(-2 * var(--dropdownOffset));
    left: 0;
    border: var(--dropdownOffset) solid transparent;
    width: 100%;
  }
`

const StyledDropdownContentItem = styled.a`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  text-decoration: none;
  color: inherit;
  transition: background-color 0.2s ease-in-out;
  border-radius: 24px;
  min-height: 56px;
  gap: 10px;

  &:hover {
    background-color: #e0e0e0;
  }

  > svg {
    display: block;
    --size: 20px;
    height: var(--size);
    width: auto;
    margin: 0 5px 0 auto;
    object-fit: contain;
    color: inherit;
  }

  > svg path {
    fill: transparent;
  }

  &:hover > svg {
    fill: currentColor;
  }

  &:hover > svg path {
    fill: currentColor;
  }
`

const DropdownContentItemIcon = styled.img`
  width: 56px;
  height: 100%;
  object-fit: contain;
`

const DropdownContentItemImage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: auto;
  height: 56px;
`

const DropdownContentItemText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const DropdownContentItemTitle = styled.span`
  font-weight: bold;
  font-size: 18px;
`

const DropdownContentItemDescription = styled.span`
  font-size: 14px;
  color: #666;
`

const DropdownContentItemButton = styled.button`
  ${StyledDropdownContentItem};
`

const DropdownMenu = styled.div`
  position: relative;
  display: inline-block;
`

const RootNavItem = styled.a`
  color: black;
  font-size: 16px;
  padding: 12px 16px;
  border-radius: 32px;
  border: none;
  text-decoration: none;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  background: transparent;
  transition: background 0.2s ease-in-out;
  cursor: pointer;
  gap: 5px;

  &:hover {
    background-color: #9c8d8d;
  }

  > svg {
    --size: 12px;
    height: var(--size);
    width: var(--size);
    object-fit: contain;
    margin-left: auto;
    fill: currentColor;
  }
`

const RightAligned = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  margin: 0 0 0 auto;
`

const GlobalSettingsWrapper = styled.div`
  position: relative;
`

const GlobalSettingsButton = styled.button`
  --size: 42px;
  --defaultFill: grey;
  --activeBackground: #555; // Active background color
  --activeFill: #fff; // Active fill color

  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  gap: 16px;
  height: var(--size);
  width: var(--size);
  border-radius: 50%;
  border: 0;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s, fill 0.2s;

  > svg {
    --size: 65%;
    height: var(--size);
    width: var(--size);
    color: currentColor;
    object-fit: contain;
    margin: auto;
  }

  > svg path {
    stroke: currentColor;
  }

  &:hover {
    background: var(--activeBackground);

    > svg {
      color: var(--activeFill);
    }
  }
`

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
  logoVariant?: keyof typeof LOGO_MAP
}

interface DropdownMenuContent {
  title: string | undefined // Allow title to be undefined
  items?: DropdownMenuItem[]
}

const NavItem = ({ item, isClickable = true }: NavItemProps & { isClickable?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false)
  const handleToggle = () => setIsOpen((prevIsOpen) => !prevIsOpen)

  return (
    <>
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
        <RootNavItem href={item.href}>{item.label}</RootNavItem>
      )}
    </>
  )
}

const DropdownContentItem: React.FC<{ item: DropdownMenuItem; theme: 'light' | 'dark' }> = ({ item, theme }) => {
  if (item.logoVariant) {
    // When logoVariant is specified, use the Logo component
    return (
      <StyledDropdownContentItem href={item.href}>
        <Logo product={item.logoVariant} themeMode={theme} />
        {item.label && <span>{item.label}</span>}
        <SVG src={IMG_ICON_ARROW_RIGHT} />
      </StyledDropdownContentItem>
    )
  } else if (item.icon) {
    // When an icon URL is specified, use an img element
    return (
      <StyledDropdownContentItem href={item.href}>
        <DropdownContentItemImage>
          <img src={item.icon} alt={item.label} style={{ width: '100%', height: '100%' }} />
        </DropdownContentItemImage>
        {item.label && <span>{item.label}</span>}
        <SVG src={IMG_ICON_ARROW_RIGHT} />
      </StyledDropdownContentItem>
    )
  } else if (item.isButton) {
    return <DropdownContentItemButton onClick={(e) => e.preventDefault()}>{item.label}</DropdownContentItemButton>
  }

  // If no logo or icon is provided, you might want to handle this case differently
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

const GenericDropdown: React.FC<DropdownProps> = ({ isOpen, content, onTrigger, interaction }) => {
  if (!content.title) {
    // Handle rendering differently or display a default title
    content.title = 'Default Title'
  }

  // This component uses onMouseEnter and onMouseLeave for hover, onClick for click
  const interactionProps =
    interaction === 'hover' ? { onMouseEnter: onTrigger, onMouseLeave: onTrigger } : { onClick: onTrigger }

  return (
    <DropdownMenu {...interactionProps}>
      <RootNavItem as="button" aria-haspopup="true" aria-expanded={isOpen}>
        <span>{content.title}</span>
        {content.items && <SVG src={IMG_ICON_CARRET_DOWN} />}
      </RootNavItem>
      {isOpen && <DropdownContentWrapper content={content} />}
    </DropdownMenu>
  )
}

const DropdownContentWrapper: React.FC<{ content: DropdownMenuContent }> = ({ content }) => {
  return (
    <DropdownContent isOpen={true}>
      {content.items?.map((item, index) => (
        <StyledDropdownContentItem key={index} href={item.href}>
          {item.icon && <DropdownContentItemIcon src={item.icon} alt="" />}
          <DropdownContentItemText>
            <DropdownContentItemTitle>{item.label}</DropdownContentItemTitle>
            {item.description && <DropdownContentItemDescription>{item.description}</DropdownContentItemDescription>}
          </DropdownContentItemText>
          <SVG src={IMG_ICON_ARROW_RIGHT} />
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
