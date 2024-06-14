import React, { ForwardedRef, forwardRef, useMemo, useRef, useState } from 'react'

import IMG_ICON_ARROW_RIGHT from '@cowprotocol/assets/images/arrow-right.svg'
import IMG_ICON_CARRET_DOWN from '@cowprotocol/assets/images/carret-down.svg'
import IMG_ICON_MENU_DOTS from '@cowprotocol/assets/images/menu-grid-dots.svg'
import IMG_ICON_MENU_HAMBURGER from '@cowprotocol/assets/images/menu-hamburger.svg'
import IMG_ICON_SETTINGS_GLOBAL from '@cowprotocol/assets/images/settings-global.svg'
import IMG_ICON_X from '@cowprotocol/assets/images/x.svg'
import { useMediaQuery, useOnClickOutside } from '@cowprotocol/common-hooks'
import { addBodyClass, removeBodyClass } from '@cowprotocol/common-utils'
import { CowSwapTheme } from '@cowprotocol/widget-lib'

import SVG from 'react-inlinesvg'
import { ThemeProvider } from 'styled-components/macro'
import { Color } from '../../consts'

import {
  DropdownContent,
  DropdownContentItemButton,
  DropdownContentItemDescription,
  DropdownContentItemIcon,
  DropdownContentItemImage,
  DropdownContentItemText,
  DropdownContentItemTitle,
  DropdownMenu,
  GlobalSettingsButton,
  MenuBarInner,
  MenuBarWrapper,
  MobileDropdownContainer,
  MobileMenuTrigger,
  NavDaoTriggerElement,
  NavItems,
  RightAligned,
  RootNavItem,
  StyledDropdownContentItem,
} from './styled'

import { Media, themeMapper } from '../../consts'
import { ProductLogo, ProductVariant } from '../ProductLogo'

const DAO_NAV_ITEMS: MenuItem[] = [
  {
    href: 'https://cow.fi/',
    productVariant: ProductVariant.CowDao,
    hasDivider: true,
    hoverColor: Color.neutral100,
    hoverBgColor: Color.neutral10,
  },
  {
    href: 'https://cow.fi/cow-swap',
    productVariant: ProductVariant.CowSwap,
    hoverColor: '#65D9FF',
    hoverBgColor: '#012F7A',
  },
  {
    href: 'https://cow.fi/cow-protocol',
    productVariant: ProductVariant.CowProtocol,
    hoverColor: '#F996EE',
    hoverBgColor: '#490072',
  },
  {
    href: 'https://cow.fi/cow-amm',
    productVariant: ProductVariant.CowAmm,
    hoverColor: '#BCEC79',
    hoverBgColor: '#194D06',
  },
  {
    href: 'https://cow.fi/mev-blocker',
    productVariant: ProductVariant.MevBlocker,
    hoverColor: '#FEE7CF',
    hoverBgColor: '#EC4612',
  },
]

export interface MenuItem {
  href?: string
  label?: string
  children?: DropdownMenuItem[]
  productVariant?: ProductVariant
  icon?: string
  isButton?: boolean
  external?: boolean
  bgColor?: string
  hoverBgColor?: string
  color?: string
  hoverColor?: string
  overrideHoverColor?: string
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
  hasDivider?: boolean
}

interface DropdownMenuItem {
  href?: string
  external?: boolean
  label?: string
  icon?: string
  description?: string
  isButton?: boolean
  children?: DropdownMenuItem[]
  productVariant?: ProductVariant
  hoverBgColor?: string
  overrideHoverColor?: string
  bgColor?: string
  color?: string
  hoverColor?: string
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
  hasDivider?: boolean
}

interface DropdownMenuContent {
  title: string | undefined
  items?: DropdownMenuItem[]
}

interface DropdownProps {
  isOpen: boolean
  content: DropdownMenuContent
  onTrigger: () => void
  closeDropdown: () => void
  interaction: 'hover' | 'click'
  mobileMode?: boolean
  isNavItemDropdown?: boolean
}

interface NavItemProps {
  item: MenuItem
  mobileMode?: boolean
  openDropdown: string | null
  closeDropdown: () => void
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
}

const NavItem = ({ item, mobileMode = false, openDropdown, closeDropdown, setOpenDropdown }: NavItemProps) => {
  const handleToggle = () => {
    setOpenDropdown((prev) => {
      return prev === item.label ? null : item.label || null
    })
  }

  return item.children ? (
    <GenericDropdown
      isOpen={openDropdown === item.label}
      content={{ title: item.label, items: item.children }}
      onTrigger={handleToggle}
      interaction="click" // Ensure it's 'click' for both mobile and desktop
      mobileMode={mobileMode}
      isNavItemDropdown={true}
      closeDropdown={closeDropdown}
    />
  ) : (
    <RootNavItem
      href={item.href}
      mobileMode={mobileMode}
      target={item.external ? '_blank' : undefined}
      rel={item.external ? 'noopener noreferrer nofollow' : undefined}
    >
      {item.label} {item.external && <span>&#8599;</span>}
    </RootNavItem>
  )
}

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
    if (item.onClick) {
      e.preventDefault()
      item.onClick(e)
      closeMenu()
    } else if (!item.children) {
      closeMenu()
    } else {
      e.preventDefault()
    }
  }

  const renderItemContent = () => {
    const { productVariant, icon, label, description, hoverColor } = item
    return (
      <>
        {productVariant ? (
          <ProductLogo
            variant={productVariant}
            overrideColor="inherit"
            overrideHoverColor={hoverColor} // Ensure hoverColor is passed here
            theme={theme}
            logoIconOnly={false}
          />
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

  const itemClassName = item.hasDivider ? 'hasDivider' : ''

  if (item.isButton) {
    return (
      <DropdownContentItemButton
        href={item.href}
        target={item.external ? '_blank' : '_self'}
        rel={item.external ? 'noopener noreferrer' : undefined}
        bgColor={item.bgColor}
        color={item.color}
        hoverBgColor={item.hoverBgColor}
        hoverColor={item.hoverColor}
        onClick={item.onClick ? handleLinkClick : undefined}
        className={itemClassName}
      >
        {renderItemContent()}
        {item.href && !item.children && (
          <SVG src={IMG_ICON_ARROW_RIGHT} className={`arrow-icon-right ${item.external ? 'external' : ''}`} />
        )}
      </DropdownContentItemButton>
    )
  }

  if (item.children) {
    return (
      <>
        <StyledDropdownContentItem
          as="div"
          onClick={handleToggleChildrenVisibility}
          isOpen={isChildrenVisible}
          className={itemClassName}
          hoverColor={item.hoverColor} // Pass hoverColor here
        >
          {renderItemContent()}
          <SVG src={IMG_ICON_CARRET_DOWN} />
        </StyledDropdownContentItem>
        {isChildrenVisible && (
          <DropdownContentWrapper
            isThirdLevel
            content={{ title: undefined, items: item.children }}
            mobileMode={true}
            closeDropdown={closeMenu}
          />
        )}
      </>
    )
  }

  return (
    <StyledDropdownContentItem
      as="a"
      href={item.href}
      onClick={handleLinkClick}
      isOpen={isChildrenVisible}
      target={item.external ? '_blank' : undefined}
      rel={item.external ? 'noopener noreferrer' : undefined}
      bgColor={item.bgColor}
      color={item.color}
      hoverBgColor={item.hoverBgColor}
      hoverColor={item.hoverColor}
      className={itemClassName}
    >
      {renderItemContent()}
      {item.external && <span>&#8599;</span>}
      {!item.children && (
        <SVG src={IMG_ICON_ARROW_RIGHT} className={`arrow-icon-right ${item.external ? 'external' : ''}`} />
      )}
    </StyledDropdownContentItem>
  )
}

const NavDaoTrigger: React.FC<{
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  theme: CowSwapTheme
  mobileMode: boolean
}> = ({ isOpen, setIsOpen, theme, mobileMode }) => {
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useOnClickOutside([triggerRef, dropdownRef], () => setIsOpen(false))

  const handleToggle = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const closeMenu = () => setIsOpen(false)

  return (
    <>
      <NavDaoTriggerElement
        ref={triggerRef}
        isActive={isOpen}
        mobileMode={mobileMode}
        onClick={handleToggle}
        isOpen={isOpen}
      >
        <SVG src={IMG_ICON_MENU_DOTS} />
      </NavDaoTriggerElement>
      {isOpen &&
        (mobileMode ? (
          <MobileDropdownContainer mobileMode={mobileMode} ref={dropdownRef}>
            <DropdownContent isOpen={true} mobileMode={mobileMode}>
              {DAO_NAV_ITEMS.map((item, index) => (
                <DropdownContentItem key={index} item={item} theme={theme} closeMenu={closeMenu} />
              ))}
            </DropdownContent>
          </MobileDropdownContainer>
        ) : (
          <DropdownContent isOpen={true} ref={dropdownRef} mobileMode={mobileMode}>
            {DAO_NAV_ITEMS.map((item, index) => (
              <DropdownContentItem key={index} item={item} theme={theme} closeMenu={closeMenu} />
            ))}
          </DropdownContent>
        ))}
    </>
  )
}

const GenericDropdown: React.FC<DropdownProps> = ({
  isOpen,
  content,
  onTrigger,
  interaction,
  mobileMode,
  isNavItemDropdown,
  closeDropdown,
}) => {
  if (!content.title) {
    throw new Error('Dropdown content must have a title')
  }

  const interactionProps = useMemo(() => {
    return interaction === 'hover'
      ? {
          onMouseEnter: onTrigger,
          onMouseLeave: onTrigger,
        }
      : {
          onClick: onTrigger,
        }
  }, [interaction, onTrigger])

  return (
    <DropdownMenu {...interactionProps} mobileMode={mobileMode}>
      <RootNavItem as="button" aria-haspopup="true" aria-expanded={isOpen} isOpen={isOpen} mobileMode={mobileMode}>
        <span>{content.title}</span>
        {content.items && <SVG src={IMG_ICON_CARRET_DOWN} />}
      </RootNavItem>
      {isOpen && (
        <DropdownContentWrapper
          content={content}
          mobileMode={mobileMode}
          isNavItemDropdown={isNavItemDropdown}
          closeDropdown={closeDropdown}
        />
      )}
    </DropdownMenu>
  )
}

interface DropdownContentWrapperProps {
  content: DropdownMenuContent
  isThirdLevel?: boolean
  isVisible?: boolean
  mobileMode?: boolean
  isNavItemDropdown?: boolean
  closeDropdown: () => void
}

const DropdownContentWrapper: React.FC<DropdownContentWrapperProps> = ({
  content,
  isThirdLevel = false,
  isVisible = true,
  mobileMode = false,
  isNavItemDropdown = false,
  closeDropdown,
}) => {
  const [visibleThirdLevel, setVisibleThirdLevel] = useState<number | null>(null)

  const handleToggleThirdLevelVisibility = (event: React.MouseEvent<HTMLDivElement>, index: number) => {
    event.preventDefault()
    event.stopPropagation()
    setVisibleThirdLevel((prevState) => (prevState === index ? null : index))
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    closeDropdown()
    e.stopPropagation()
  }

  return (
    <DropdownContent
      isOpen={isVisible}
      isThirdLevel={isThirdLevel}
      mobileMode={mobileMode}
      isNavItemDropdown={isNavItemDropdown}
    >
      {content.items?.map((item: DropdownMenuItem, index: number) => {
        const hasChildren = !!item.children
        const Tag = hasChildren ? 'div' : item.isButton ? DropdownContentItemButton : 'a'
        return (
          <StyledDropdownContentItem
            key={index}
            as={Tag}
            href={!hasChildren ? item.href : undefined}
            isOpen={visibleThirdLevel === index}
            isThirdLevel={isThirdLevel}
            target={!hasChildren && item.external ? '_blank' : undefined}
            rel={!hasChildren && item.external ? 'noopener noreferrer nofollow' : undefined}
            bgColor={item.bgColor}
            color={item.color}
            hoverBgColor={item.hoverBgColor}
            hoverColor={item.hoverColor}
            mobileMode={mobileMode}
            onClick={(e: React.MouseEvent<HTMLDivElement | HTMLAnchorElement | HTMLButtonElement>) => {
              if (hasChildren) {
                handleToggleThirdLevelVisibility(e as React.MouseEvent<HTMLDivElement>, index)
              } else if (item.isButton) {
                handleLinkClick(e as React.MouseEvent<HTMLAnchorElement>)
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
            {!item.children && (
              <SVG src={IMG_ICON_ARROW_RIGHT} className={`arrow-icon-right ${item.external ? 'external' : ''}`} />
            )}
            {item.children && visibleThirdLevel === index && (
              <DropdownContentWrapper
                content={{ title: undefined, items: item.children }}
                isThirdLevel
                isVisible={visibleThirdLevel === index}
                mobileMode={mobileMode}
                isNavItemDropdown={isNavItemDropdown}
                closeDropdown={closeDropdown}
              />
            )}
          </StyledDropdownContentItem>
        )
      })}
    </DropdownContent>
  )
}

interface GlobalSettingsDropdownProps {
  mobileMode: boolean
  settingsNavItems?: MenuItem[]
  isOpen: boolean
  closeDropdown: () => void
}

const GlobalSettingsDropdown = forwardRef(
  (props: GlobalSettingsDropdownProps, dropdownRef: ForwardedRef<HTMLDivElement> | null) => {
    const { mobileMode, settingsNavItems, isOpen, closeDropdown } = props

    if (!settingsNavItems || settingsNavItems.length === 0) {
      return null
    }

    return (
      <>
        {isOpen &&
          (mobileMode ? (
            <MobileDropdownContainer mobileMode={mobileMode} ref={dropdownRef}>
              <DropdownContent isOpen={true} alignRight={true} mobileMode={mobileMode}>
                {settingsNavItems.map((item, index) => (
                  <StyledDropdownContentItem
                    key={index}
                    href={item.href}
                    onClick={_onDropdownItemClickFactory(item, closeDropdown)} // Handle onClick here
                  >
                    <DropdownContentItemText>
                      <DropdownContentItemTitle>{item.label}</DropdownContentItemTitle>
                    </DropdownContentItemText>
                    <SVG src={IMG_ICON_ARROW_RIGHT} className="arrow-icon-right" />
                  </StyledDropdownContentItem>
                ))}
              </DropdownContent>
            </MobileDropdownContainer>
          ) : (
            <DropdownContent isOpen={true} ref={dropdownRef} alignRight={true} mobileMode={mobileMode}>
              {settingsNavItems.map((item, index) => (
                <StyledDropdownContentItem
                  key={index}
                  href={item.href}
                  onClick={_onDropdownItemClickFactory(item, closeDropdown)} // Handle onClick here
                >
                  <DropdownContentItemText>
                    <DropdownContentItemTitle>{item.label}</DropdownContentItemTitle>
                  </DropdownContentItemText>
                  <SVG src={IMG_ICON_ARROW_RIGHT} className="arrow-icon-right" />
                </StyledDropdownContentItem>
              ))}
            </DropdownContent>
          ))}
      </>
    )
  }
)

function _onDropdownItemClickFactory(item: MenuItem, postClick?: () => void) {
  return (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    item.onClick?.(e)
    postClick?.()
  }
}

interface MenuBarProps {
  navItems: MenuItem[]
  theme: 'light' | 'dark'
  productVariant: ProductVariant
  persistentAdditionalContent?: React.ReactNode // Content that always stays in the MenuBar
  additionalContent?: React.ReactNode // Content that moves to mobile menu on mobile
  showGlobalSettings?: boolean
  settingsNavItems?: MenuItem[]
  additionalNavButtons?: MenuItem[]
  bgColorLight?: string
  bgColorDark?: string
  bgDropdownColorLight?: string
  bgDropdownColorDark?: string
  colorLight?: string
  colorDark?: string
  defaultFillLight?: string
  defaultFillDark?: string
  activeBackgroundLight?: string
  activeBackgroundDark?: string
  activeFillLight?: string
  activeFillDark?: string
  hoverBackgroundLight?: string
  hoverBackgroundDark?: string
  padding?: string
}

export const MenuBar = (props: MenuBarProps) => {
  const {
    navItems,
    theme,
    productVariant,
    persistentAdditionalContent,
    additionalContent,
    showGlobalSettings,
    additionalNavButtons,
    settingsNavItems,
    bgColorLight,
    bgColorDark,
    bgDropdownColorLight,
    bgDropdownColorDark,
    colorLight,
    colorDark,
    defaultFillLight,
    defaultFillDark,
    activeBackgroundLight,
    activeBackgroundDark,
    activeFillLight,
    activeFillDark,
    hoverBackgroundLight,
    hoverBackgroundDark,
    padding,
  } = props

  const [isDaoOpen, setIsDaoOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const menuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLUListElement>(null)
  const mobileMenuTriggerRef = useRef<HTMLDivElement>(null)
  const navItemsRef = useRef<HTMLUListElement>(null)
  const settingsButtonRef = useRef<HTMLButtonElement>(null)
  const settingsDropdownRef = useRef<HTMLDivElement>(null)

  const handleSettingsToggle = () => setIsSettingsOpen((prev) => !prev)

  const styledTheme = {
    ...themeMapper(theme),
    mode: theme,
  }

  const isMobile = useMediaQuery(Media.upToLarge(false))

  useOnClickOutside([menuRef], () => setIsDaoOpen(false))

  useOnClickOutside(isMobile ? [mobileMenuRef] : [navItemsRef], () => setOpenDropdown(null))

  useOnClickOutside([mobileMenuRef, mobileMenuTriggerRef], () => setIsMobileMenuOpen(false))

  useOnClickOutside([settingsButtonRef, settingsDropdownRef], () => setIsSettingsOpen(false))

  const handleMobileMenuToggle = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setIsMobileMenuOpen((prev) => !prev)
  }

  React.useEffect(() => {
    if (isMobile) {
      if (isMobileMenuOpen || isDaoOpen || isSettingsOpen) {
        addBodyClass('noScroll')
      } else {
        removeBodyClass('noScroll')
      }
    }

    return () => {
      removeBodyClass('noScroll')
    }
  }, [isMobile, isMobileMenuOpen, isDaoOpen, isSettingsOpen])

  return (
    <ThemeProvider theme={styledTheme}>
      <MenuBarWrapper
        ref={menuRef}
        theme={styledTheme}
        bgColorLight={bgColorLight}
        bgColorDark={bgColorDark}
        bgDropdownColorLight={bgDropdownColorLight}
        bgDropdownColorDark={bgDropdownColorDark}
        colorLight={colorLight}
        colorDark={colorDark}
        defaultFillLight={defaultFillLight}
        defaultFillDark={defaultFillDark}
        activeBackgroundLight={activeBackgroundLight}
        activeBackgroundDark={activeBackgroundDark}
        activeFillLight={activeFillLight}
        activeFillDark={activeFillDark}
        hoverBackgroundLight={hoverBackgroundLight}
        hoverBackgroundDark={hoverBackgroundDark}
        padding={padding}
        mobileMode={isMobile}
      >
        <MenuBarInner theme={styledTheme}>
          <NavDaoTrigger isOpen={isDaoOpen} setIsOpen={setIsDaoOpen} theme={theme} mobileMode={isMobile} />
          <ProductLogo variant={productVariant} theme={theme} logoIconOnly={isMobile} href="/" />

          {!isMobile && (
            <NavItems theme={styledTheme} ref={navItemsRef}>
              {navItems.map((item, index) => (
                <NavItem
                  key={index}
                  item={item}
                  mobileMode={isMobile}
                  openDropdown={openDropdown}
                  closeDropdown={() => setOpenDropdown(null)}
                  setOpenDropdown={setOpenDropdown}
                />
              ))}
            </NavItems>
          )}

          <RightAligned mobileMode={isMobile} flexFlowMobile="row wrap">
            {persistentAdditionalContent} {/* Always render this content */}
            {!isMobile && additionalContent} {/* Render this content only on desktop */}
            {!isMobile &&
              additionalNavButtons &&
              additionalNavButtons.map((item, index) => (
                <DropdownContentItemButton
                  key={index}
                  href={item.href}
                  target={item.external ? '_blank' : '_self'}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  bgColor={item.bgColor}
                  color={item.color}
                  hoverBgColor={item.hoverBgColor}
                  hoverColor={item.hoverColor}
                  mobileMode={isMobile}
                >
                  <DropdownContentItemText>
                    <DropdownContentItemTitle>{item.label}</DropdownContentItemTitle>
                  </DropdownContentItemText>
                  <SVG src={IMG_ICON_ARROW_RIGHT} className={`arrow-icon-right ${item.external ? 'external' : ''}`} />
                </DropdownContentItemButton>
              ))}
            {showGlobalSettings && settingsNavItems && (
              <>
                <GlobalSettingsButton ref={settingsButtonRef} mobileMode={isMobile} onClick={handleSettingsToggle}>
                  <SVG src={IMG_ICON_SETTINGS_GLOBAL} />
                </GlobalSettingsButton>
                {isSettingsOpen && (
                  <GlobalSettingsDropdown
                    mobileMode={isMobile}
                    settingsNavItems={settingsNavItems}
                    isOpen={isSettingsOpen}
                    closeDropdown={handleSettingsToggle}
                    ref={settingsDropdownRef}
                  />
                )}
              </>
            )}
          </RightAligned>

          {isMobile && (
            <MobileMenuTrigger
              ref={mobileMenuTriggerRef}
              theme={styledTheme}
              mobileMode={isMobile}
              onClick={handleMobileMenuToggle}
            >
              <SVG src={isMobileMenuOpen ? IMG_ICON_X : IMG_ICON_MENU_HAMBURGER} />
            </MobileMenuTrigger>
          )}
        </MenuBarInner>

        {isMobile && isMobileMenuOpen && (
          <NavItems mobileMode={isMobile} ref={mobileMenuRef} theme={styledTheme}>
            <div>
              {navItems.map((item, index) => (
                <NavItem
                  key={index}
                  item={item}
                  mobileMode={isMobile}
                  openDropdown={openDropdown}
                  closeDropdown={() => {
                    setIsMobileMenuOpen(false)
                    setOpenDropdown(null)
                  }}
                  setOpenDropdown={setOpenDropdown}
                />
              ))}
              <RightAligned mobileMode={isMobile}>
                {additionalContent} {/* Add additional content here */}
                {additionalNavButtons &&
                  additionalNavButtons.map((item, index) => (
                    <DropdownContentItemButton
                      key={index}
                      href={item.href}
                      target={item.external ? '_blank' : '_self'}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      bgColor={item.bgColor}
                      color={item.color}
                      hoverBgColor={item.hoverBgColor}
                      hoverColor={item.hoverColor}
                    >
                      <DropdownContentItemText>
                        <DropdownContentItemTitle>{item.label}</DropdownContentItemTitle>
                      </DropdownContentItemText>
                      <SVG
                        src={IMG_ICON_ARROW_RIGHT}
                        className={`arrow-icon-right ${item.external ? 'external' : ''}`}
                      />
                    </DropdownContentItemButton>
                  ))}
              </RightAligned>
            </div>
          </NavItems>
        )}
      </MenuBarWrapper>
    </ThemeProvider>
  )
}
