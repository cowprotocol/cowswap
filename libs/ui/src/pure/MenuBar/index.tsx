import React, {
  ForwardedRef,
  forwardRef,
  useMemo,
  useRef,
  useState,
  useEffect,
  ComponentType,
  PropsWithChildren,
} from 'react'

import IMG_ICON_ARROW_RIGHT from '@cowprotocol/assets/images/arrow-right.svg'
import IMG_ICON_CARRET_DOWN from '@cowprotocol/assets/images/carret-down.svg'
import IMG_ICON_MENU_DOTS from '@cowprotocol/assets/images/menu-grid-dots.svg'
import IMG_ICON_MENU_HAMBURGER from '@cowprotocol/assets/images/menu-hamburger.svg'
import IMG_ICON_SETTINGS_GLOBAL from '@cowprotocol/assets/images/settings-global.svg'
import IMG_ICON_X from '@cowprotocol/assets/images/x.svg'
import { useMediaQuery, useOnClickOutside } from '@cowprotocol/common-hooks'
import { addBodyClass, removeBodyClass } from '@cowprotocol/common-utils'

import SVG from 'react-inlinesvg'

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

import { Color } from '../../consts'
import { Media } from '../../consts'
import { ProductLogo, ProductVariant } from '../ProductLogo'

const DAO_NAV_ITEMS: MenuItem[] = [
  {
    href: 'https://cow.fi/',
    productVariant: ProductVariant.CowDao,
    hasDivider: true,
    hoverColor: Color.neutral100,
    hoverBgColor: Color.neutral20,
    external: true,
    utmContent: 'menubar-dao-nav-cowdao',
  },
  {
    href: 'https://swap.cow.fi/',
    productVariant: ProductVariant.CowSwap,
    hoverColor: '#65D9FF',
    hoverBgColor: '#012F7A',
    external: true,
    utmContent: 'menubar-dao-nav-cowswap',
  },
  {
    href: 'https://cow.fi/cow-protocol',
    productVariant: ProductVariant.CowProtocol,
    hoverColor: '#FCCAF2',
    hoverBgColor: '#AD02C6',
    external: true,
    utmContent: 'menubar-dao-nav-cowprotocol',
  },
  {
    href: 'https://cow.fi/cow-amm',
    productVariant: ProductVariant.CowAmm,
    hoverColor: '#007CDB',
    hoverBgColor: '#CCF8FF',
    external: true,
    utmContent: 'menubar-dao-nav-cowamm',
  },
  {
    href: 'https://cow.fi/mev-blocker',
    productVariant: ProductVariant.MevBlocker,
    hoverColor: '#F2CD16',
    hoverBgColor: '#EC4612',
    external: true,
  },
]

type LinkComponentType = ComponentType<PropsWithChildren<{ href: string }>>

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
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void
  hasDivider?: boolean
  utmContent?: string
  utmSource?: string
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
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void
  hasDivider?: boolean
  utmContent?: string
  utmSource?: string
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
  rootDomain: string
  LinkComponent: LinkComponentType
}

interface NavItemProps {
  item: MenuItem
  mobileMode?: boolean
  openDropdown: string | null
  closeDropdown: () => void
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  LinkComponent: LinkComponentType
  rootDomain: string
}

const NavItem = ({
  item,
  mobileMode = false,
  openDropdown,
  closeDropdown,
  setOpenDropdown,
  rootDomain,
  LinkComponent,
}: NavItemProps) => {
  const handleToggle = () => {
    setOpenDropdown((prev) => {
      return prev === item.label ? null : item.label || null
    })
  }

  const href = item.external
    ? appendUtmParams(item.href!, item.utmSource, item.utmContent, rootDomain, item.external, item.label)
    : item.href

  return item.children ? (
    <GenericDropdown
      isOpen={openDropdown === item.label}
      content={{ title: item.label, items: item.children }}
      onTrigger={handleToggle}
      interaction="click" // Ensure it's 'click' for both mobile and desktop
      mobileMode={mobileMode}
      isNavItemDropdown={true}
      closeDropdown={closeDropdown}
      rootDomain={rootDomain}
      LinkComponent={LinkComponent}
    />
  ) : href ? (
    <RootNavItem mobileMode={mobileMode}>
      <LinkComponent href={href}>
        {item.label} {item.external && <span>&#8599;</span>}
      </LinkComponent>
    </RootNavItem>
  ) : null
}

const DropdownContentItem: React.FC<{
  item: DropdownMenuItem
  closeMenu: () => void
  rootDomain: string
  LinkComponent: LinkComponentType
}> = ({ item, closeMenu, rootDomain, LinkComponent }) => {
  const [isChildrenVisible, setIsChildrenVisible] = useState(false)

  const handleToggleChildrenVisibility = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsChildrenVisible(!isChildrenVisible)
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
            overrideHoverColor={hoverColor}
            logoIconOnly={false}
          />
        ) : icon ? (
          <DropdownContentItemImage>
            <img src={icon} alt={label} />
          </DropdownContentItemImage>
        ) : null}
        {label && (
          <DropdownContentItemText>
            <DropdownContentItemTitle>{label}</DropdownContentItemTitle>
            {description && <DropdownContentItemDescription>{description}</DropdownContentItemDescription>}
          </DropdownContentItemText>
        )}
      </>
    )
  }

  const itemClassName = item.hasDivider ? 'hasDivider' : ''

  const href = item.external
    ? appendUtmParams(item.href!, item.utmSource, item.utmContent, rootDomain, item.external, item.label)
    : item.href

  if (item.isButton && item.href) {
    return (
      <DropdownContentItemButton
        bgColor={item.bgColor}
        color={item.color}
        hoverBgColor={item.hoverBgColor}
        hoverColor={item.hoverColor}
        onClick={item.onClick ? handleLinkClick : undefined}
        className={itemClassName}
      >
        <LinkComponent href={item.href}>
          {renderItemContent()}
          {item.href && !item.children && (
            <SVG src={IMG_ICON_ARROW_RIGHT} className={`arrow-icon-right ${item.external ? 'external' : ''}`} />
          )}
        </LinkComponent>
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
          hoverColor={item.hoverColor}
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
            rootDomain={rootDomain}
            LinkComponent={LinkComponent}
          />
        )}
      </>
    )
  }

  if (!href) return null

  return (
    <StyledDropdownContentItem
      onClick={handleLinkClick}
      isOpen={isChildrenVisible}
      bgColor={item.bgColor}
      color={item.color}
      hoverBgColor={item.hoverBgColor}
      hoverColor={item.hoverColor}
      className={itemClassName}
    >
      <LinkComponent href={href}>
        {renderItemContent()}
        {item.external && !item.children && <SVG src={IMG_ICON_ARROW_RIGHT} className="arrow-icon-right external" />}
        {!item.external && !item.children && <SVG src={IMG_ICON_ARROW_RIGHT} className="arrow-icon-right" />}
      </LinkComponent>
    </StyledDropdownContentItem>
  )
}

const NavDaoTrigger: React.FC<{
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  mobileMode: boolean
  rootDomain: string
  LinkComponent: LinkComponentType
}> = ({ isOpen, setIsOpen, mobileMode, rootDomain, LinkComponent }) => {
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
            {DAO_NAV_ITEMS.map((item, index) => (
              <DropdownContentItem
                key={index}
                item={item}
                closeMenu={closeMenu}
                rootDomain={rootDomain}
                LinkComponent={LinkComponent}
              />
            ))}
          </MobileDropdownContainer>
        ) : (
          <DropdownContent isOpen={true} ref={dropdownRef} mobileMode={mobileMode}>
            {DAO_NAV_ITEMS.map((item, index) => (
              <DropdownContentItem
                key={index}
                item={item}
                closeMenu={closeMenu}
                rootDomain={rootDomain}
                LinkComponent={LinkComponent}
              />
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
  rootDomain,
  LinkComponent,
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
          rootDomain={rootDomain}
          LinkComponent={LinkComponent}
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
  rootDomain: string
  LinkComponent: LinkComponentType
}

const DropdownContentWrapper: React.FC<DropdownContentWrapperProps> = ({
  content,
  isThirdLevel = false,
  isVisible = true,
  mobileMode = false,
  isNavItemDropdown = false,
  closeDropdown,
  rootDomain,
  LinkComponent,
}) => {
  const [visibleThirdLevel, setVisibleThirdLevel] = useState<number | null>(null)

  const handleToggleThirdLevelVisibility = (event: React.MouseEvent<HTMLDivElement>, index: number) => {
    event.preventDefault()
    event.stopPropagation()
    setVisibleThirdLevel((prevState) => (prevState === index ? null : index))
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLElement>) => {
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
        const Tag = hasChildren ? 'div' : item.isButton ? DropdownContentItemButton : undefined
        const href = !hasChildren
          ? appendUtmParams(item.href!, item.utmSource, item.utmContent, rootDomain, !!item.external, item.label)
          : undefined

        const content = (
          <>
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
                rootDomain={rootDomain}
                LinkComponent={LinkComponent}
              />
            )}
          </>
        )

        return (
          <StyledDropdownContentItem
            key={index}
            as={Tag}
            isOpen={visibleThirdLevel === index}
            isThirdLevel={isThirdLevel}
            target={!hasChildren && item.external ? '_blank' : undefined}
            rel={!hasChildren && item.external ? 'noopener noreferrer nofollow' : undefined}
            bgColor={item.bgColor}
            color={item.color}
            hoverBgColor={item.hoverBgColor}
            hoverColor={item.hoverColor}
            mobileMode={mobileMode}
            onClick={(e: React.MouseEvent<HTMLElement>) => {
              if (hasChildren) {
                handleToggleThirdLevelVisibility(e as React.MouseEvent<HTMLDivElement>, index)
              } else {
                handleLinkClick(e)
              }
            }}
          >
            {href ? <LinkComponent href={href}>{content}</LinkComponent> : <div>{content}</div>}
          </StyledDropdownContentItem>
        )
      })}
    </DropdownContent>
  )
}

const appendUtmParams = (
  href: string,
  utmSource: string | undefined,
  utmContent: string | undefined,
  rootDomain: string,
  isExternal: boolean,
  label: string | undefined
) => {
  const defaultUtm = {
    utmSource: rootDomain,
    utmMedium: 'web',
    utmContent: `menubar-nav-button-${label?.toLowerCase().replace(/\s+/g, '-')}`,
  }
  const finalUtmSource = utmSource || defaultUtm.utmSource
  const finalUtmContent = utmContent || defaultUtm.utmContent

  if (isExternal) {
    const url = href.startsWith('http') ? new URL(href) : new URL(href, `https://${rootDomain}`)

    const hash = url.hash
    url.hash = '' // Remove the hash temporarily to prevent it from interfering with the search params
    url.searchParams.set('utm_source', finalUtmSource)
    url.searchParams.set('utm_medium', defaultUtm.utmMedium)
    url.searchParams.set('utm_content', finalUtmContent)
    url.hash = hash // Re-attach the hash

    return url.toString()
  }

  return href
}

interface GlobalSettingsDropdownProps {
  mobileMode: boolean
  settingsNavItems?: MenuItem[]
  isOpen: boolean
  closeDropdown: () => void
  rootDomain: string
  LinkComponent: LinkComponentType
}

const GlobalSettingsDropdown = forwardRef(
  (props: GlobalSettingsDropdownProps, dropdownRef: ForwardedRef<HTMLDivElement> | null) => {
    const { mobileMode, settingsNavItems, isOpen, closeDropdown, rootDomain, LinkComponent } = props

    if (!settingsNavItems || settingsNavItems.length === 0) {
      return null
    }

    return (
      <>
        {isOpen &&
          (mobileMode ? (
            <MobileDropdownContainer mobileMode={mobileMode} ref={dropdownRef}>
              <DropdownContent isOpen={true} alignRight={true} mobileMode={mobileMode}>
                {settingsNavItems.map((item, index) => {
                  const to = item.external
                    ? appendUtmParams(
                        item.href!,
                        item.utmSource,
                        item.utmContent,
                        rootDomain,
                        item.external,
                        item.label
                      )
                    : item.href
                    ? `${new URL(item.href, `https://${rootDomain}`).pathname}`
                    : undefined

                  const content = (
                    <>
                      <DropdownContentItemText>
                        <DropdownContentItemTitle>{item.label}</DropdownContentItemTitle>
                      </DropdownContentItemText>
                      <SVG src={IMG_ICON_ARROW_RIGHT} className="arrow-icon-right" />
                    </>
                  )

                  return (
                    <StyledDropdownContentItem
                      key={index}
                      onClick={_onDropdownItemClickFactory(item, closeDropdown)} // Handle onClick here
                    >
                      {to ? <LinkComponent href={to}>{content}</LinkComponent> : <div>{content}</div>}
                    </StyledDropdownContentItem>
                  )
                })}
              </DropdownContent>
            </MobileDropdownContainer>
          ) : (
            <DropdownContent isOpen={true} ref={dropdownRef} alignRight={true} mobileMode={mobileMode}>
              {settingsNavItems.map((item, index) => {
                const to = item.external
                  ? appendUtmParams(item.href!, item.utmSource, item.utmContent, rootDomain, item.external, item.label)
                  : item.href

                const content = (
                  <>
                    <DropdownContentItemText>
                      <DropdownContentItemTitle>{item.label}</DropdownContentItemTitle>
                    </DropdownContentItemText>
                    <SVG src={IMG_ICON_ARROW_RIGHT} className="arrow-icon-right" />
                  </>
                )

                return (
                  <StyledDropdownContentItem
                    key={index}
                    onClick={_onDropdownItemClickFactory(item, closeDropdown)} // Handle onClick here
                  >
                    {to ? <LinkComponent href={to}>{content}</LinkComponent> : <div>{content}</div>}
                  </StyledDropdownContentItem>
                )
              })}
            </DropdownContent>
          ))}
      </>
    )
  }
)

function _onDropdownItemClickFactory(item: MenuItem, postClick?: () => void) {
  return (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    item.onClick?.(e)
    postClick?.()
  }
}

interface MenuBarProps {
  navItems: MenuItem[]
  productVariant: ProductVariant
  LinkComponent: LinkComponentType
  persistentAdditionalContent?: React.ReactNode
  additionalContent?: React.ReactNode
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
  maxWidth?: number
}

export const MenuBar = (props: MenuBarProps) => {
  const {
    navItems,
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
    maxWidth,
    LinkComponent,
  } = props

  const [isDaoOpen, setIsDaoOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLUListElement>(null)
  const mobileMenuTriggerRef = useRef<HTMLDivElement>(null)
  const navItemsRef = useRef<HTMLUListElement>(null)
  const settingsButtonRef = useRef<HTMLButtonElement>(null)
  const settingsDropdownRef = useRef<HTMLDivElement>(null)

  const rootDomain = typeof window !== 'undefined' ? window.location.host : ''

  const handleSettingsToggle = () => setIsSettingsOpen((prev) => !prev)

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

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <MenuBarWrapper
      ref={menuRef}
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
      maxWidth={maxWidth}
    >
      <MenuBarInner>
        <NavDaoTrigger
          isOpen={isDaoOpen}
          setIsOpen={setIsDaoOpen}
          mobileMode={isMobile}
          rootDomain={rootDomain}
          LinkComponent={LinkComponent}
        />
        <ProductLogo variant={productVariant} logoIconOnly={isMobile} height={30} href="/" />

        {!isMobile && (
          <NavItems ref={navItemsRef}>
            {navItems.map((item, index) => (
              <NavItem
                key={index}
                item={item}
                LinkComponent={LinkComponent}
                mobileMode={isMobile}
                openDropdown={openDropdown}
                closeDropdown={() => setOpenDropdown(null)}
                setOpenDropdown={setOpenDropdown}
                rootDomain={rootDomain}
              />
            ))}
          </NavItems>
        )}

        <RightAligned mobileMode={isMobile} flexFlowMobile="row wrap">
          {persistentAdditionalContent} {/* Always render this content */}
          {!isMobile && additionalContent} {/* Render this content only on desktop */}
          {!isMobile &&
            isLoaded &&
            additionalNavButtons &&
            additionalNavButtons.map((item, index) => {
              const href = item.external
                ? appendUtmParams(item.href!, item.utmSource, item.utmContent, rootDomain, item.external, item.label)
                : item.href

              if (!href) return null

              return (
                <DropdownContentItemButton
                  key={index}
                  bgColor={item.bgColor}
                  color={item.color}
                  hoverBgColor={item.hoverBgColor}
                  hoverColor={item.hoverColor}
                  mobileMode={isMobile}
                >
                  <LinkComponent href={href}>
                    <DropdownContentItemText>
                      <DropdownContentItemTitle>{item.label}</DropdownContentItemTitle>
                    </DropdownContentItemText>
                    <SVG src={IMG_ICON_ARROW_RIGHT} className={`arrow-icon-right ${item.external ? 'external' : ''}`} />
                  </LinkComponent>
                </DropdownContentItemButton>
              )
            })}
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
                  rootDomain={rootDomain}
                  LinkComponent={LinkComponent}
                />
              )}
            </>
          )}
        </RightAligned>

        {isMobile && (
          <MobileMenuTrigger ref={mobileMenuTriggerRef} mobileMode={isMobile} onClick={handleMobileMenuToggle}>
            <SVG src={isMobileMenuOpen ? IMG_ICON_X : IMG_ICON_MENU_HAMBURGER} />
          </MobileMenuTrigger>
        )}
      </MenuBarInner>

      {isMobile && isMobileMenuOpen && (
        <NavItems mobileMode={isMobile} ref={mobileMenuRef}>
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
                rootDomain={rootDomain}
                LinkComponent={LinkComponent}
              />
            ))}
            <RightAligned mobileMode={isMobile}>
              {additionalContent} {/* Add additional content here */}
              {additionalNavButtons &&
                additionalNavButtons.map((item, index) => (
                  <DropdownContentItemButton
                    key={index}
                    bgColor={item.bgColor}
                    color={item.color}
                    hoverBgColor={item.hoverBgColor}
                    hoverColor={item.hoverColor}
                  >
                    <LinkComponent
                      href={appendUtmParams(
                        item.href!,
                        item.utmSource,
                        item.utmContent,
                        rootDomain,
                        !!item.external,
                        item.label
                      )}
                    >
                      <DropdownContentItemText>
                        <DropdownContentItemTitle>{item.label}</DropdownContentItemTitle>
                      </DropdownContentItemText>
                      <SVG
                        src={IMG_ICON_ARROW_RIGHT}
                        className={`arrow-icon-right ${item.external ? 'external' : ''}`}
                      />
                    </LinkComponent>
                  </DropdownContentItemButton>
                ))}
            </RightAligned>
          </div>
        </NavItems>
      )}
    </MenuBarWrapper>
  )
}
