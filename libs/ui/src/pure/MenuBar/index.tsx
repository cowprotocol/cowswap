import React, {
  ComponentType,
  forwardRef,
  isValidElement,
  PropsWithChildren,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import IMG_ICON_ARROW_RIGHT from '@cowprotocol/assets/images/arrow-right.svg'
import IMG_ICON_CARRET_DOWN from '@cowprotocol/assets/images/carret-down.svg'
import IMG_ICON_MENU_DOTS from '@cowprotocol/assets/images/menu-grid-dots.svg'
import IMG_ICON_MENU_HAMBURGER from '@cowprotocol/assets/images/menu-hamburger.svg'
import IMG_ICON_SETTINGS_GLOBAL from '@cowprotocol/assets/images/settings-global.svg'
import IMG_ICON_X from '@cowprotocol/assets/images/x.svg'
import { useMediaQuery, useOnClickOutside } from '@cowprotocol/common-hooks'
import { addBodyClass, isLinguiInternationalizationEnabled, removeBodyClass } from '@cowprotocol/common-utils'

import { i18n } from '@lingui/core'
import { t } from '@lingui/core/macro'
import { flag } from 'country-emoji'
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
  LanguageSettingsButton,
  LanguagesDropdownWrapper,
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

import { Media } from '../../consts'
import { UI } from '../../enum'
import { BadgeType } from '../../types'
import { Badge } from '../Badge'
import { ProductLogo, ProductVariant } from '../ProductLogo'

import type { CowSwapTheme } from '../../types'

const DAO_NAV_ITEMS: MenuItem[] = [
  {
    href: 'https://cow.fi/',
    productVariant: ProductVariant.CowDao,
    hasDivider: true,
    hoverColor: `var(${UI.COLOR_NEUTRAL_100})`,
    hoverBgColor: `var(${UI.COLOR_NEUTRAL_20})`,
    external: true,
    utmContent: 'menubar-dao-nav-cowdao',
  },
  {
    href: 'https://swap.cow.fi/',
    productVariant: ProductVariant.CowSwap,
    hoverColor: `var(${UI.COLOR_BLUE_300_PRIMARY})`,
    hoverBgColor: `var(${UI.COLOR_BLUE_900_PRIMARY})`,
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
    utmContent: 'menubar-dao-nav-mevblocker',
  },
]

const getLanguageName = (locale: string): string => {
  const display = new Intl.DisplayNames([locale], { type: 'language' })
  const languageName = display.of(locale)

  return languageName ? languageName : t`Language ${locale} not found`
}

const getFlag = (locale: string): string => flag((locale.split('-')[1] as string) || (locale as string)) || ''

type LinkComponentType = ComponentType<PropsWithChildren<{ href: string }>>

export interface MenuItem {
  href?: string
  label?: string
  badge?: string | ReactElement
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
  onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>) => void
  hasDivider?: boolean
  utmContent?: string
  utmSource?: string
  badgeImage?: string
  badgeType?: BadgeType
}

interface DropdownMenuItem {
  href?: string
  external?: boolean
  label?: string
  icon?: string
  badge?: string | ReactElement
  description?: string
  isButton?: boolean
  children?: DropdownMenuItem[]
  productVariant?: ProductVariant
  hoverBgColor?: string
  overrideHoverColor?: string
  bgColor?: string
  color?: string
  hoverColor?: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>) => void
  hasDivider?: boolean
  utmContent?: string
  utmSource?: string
  badgeImage?: string
  badgeType?: BadgeType
}

interface DropdownMenuContent {
  title: string | undefined
  items?: DropdownMenuItem[]
}

interface DropdownProps {
  isOpen: boolean
  item: MenuItem
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
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
}: NavItemProps) => {
  const extractedLabel = item.label

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleToggle = () => {
    setOpenDropdown((prev) => {
      return prev === extractedLabel ? null : extractedLabel || null
    })
  }

  const href = item.external
    ? appendUtmParams(item.href!, item.utmSource, item.utmContent, rootDomain, item.external, extractedLabel)
    : item.href

  return item.children ? (
    <GenericDropdown
      isOpen={openDropdown === extractedLabel}
      item={item}
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
        {extractedLabel} {item.external && <span>&#8599;</span>}
      </LinkComponent>
    </RootNavItem>
  ) : null
}

const DropdownContentItem: React.FC<{
  item: DropdownMenuItem
  closeMenu: () => void
  rootDomain: string
  LinkComponent: LinkComponentType
  // TODO: Break down this large function into smaller functions
  // TODO: Reduce function complexity by extracting logic
  // eslint-disable-next-line max-lines-per-function, complexity
}> = ({ item, closeMenu, rootDomain, LinkComponent }) => {
  const [isChildrenVisible, setIsChildrenVisible] = useState(false)

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleToggleChildrenVisibility = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsChildrenVisible(!isChildrenVisible)
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleLinkClick = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
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

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const renderItemContent = () => {
    const { productVariant, icon, label, description, hoverColor } = item
    const extractedLabel = label

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
            <img src={icon} alt={extractedLabel} />
          </DropdownContentItemImage>
        ) : null}
        {extractedLabel && (
          <DropdownContentItemText>
            <DropdownContentItemTitle>{extractedLabel}</DropdownContentItemTitle>
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
        as={item.isButton ? 'button' : 'div'}
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
      onClick={(e: React.MouseEvent<HTMLLIElement>) => {
        handleLinkClick(e as unknown as React.MouseEvent<HTMLButtonElement | HTMLDivElement>)
      }}
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
  // TODO: Break down this large function into smaller functions
}> = ({ isOpen, setIsOpen, mobileMode, rootDomain, LinkComponent }) => {
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)

  useOnClickOutside([triggerRef, dropdownRef], () => setIsOpen(false))

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleToggle = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
          <MobileDropdownContainer
            mobileMode={mobileMode}
            ref={dropdownRef as unknown as React.RefObject<HTMLDivElement>}
          >
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
  item,
  onTrigger,
  interaction,
  mobileMode,
  isNavItemDropdown,
  closeDropdown,
  rootDomain,
  LinkComponent,
}) => {
  if (!item.label) {
    throw new Error('Dropdown content must have a title and children')
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

  const extractedLabel = item.label

  return (
    <DropdownMenu {...interactionProps} mobileMode={mobileMode}>
      <RootNavItem as="button" aria-haspopup="true" aria-expanded={isOpen} isOpen={isOpen} mobileMode={mobileMode}>
        <span>{extractedLabel}</span>
        {(item.badge || item.badgeImage) && (
          <Badge {...(item.badgeType && { type: item.badgeType })}>
            {item.badgeImage ? <SVG src={item.badgeImage} /> : isValidElement(item.badge) ? item.badge : item.badge}
          </Badge>
        )}
        {item.children && <SVG src={IMG_ICON_CARRET_DOWN} />}
      </RootNavItem>
      {isOpen && (
        <DropdownContentWrapper
          content={{ title: extractedLabel, items: item.children }}
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

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
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

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleToggleThirdLevelVisibility = (event: React.MouseEvent<HTMLDivElement>, index: number) => {
    event.preventDefault()
    event.stopPropagation()
    setVisibleThirdLevel((prevState) => (prevState === index ? null : index))
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
      {/* TODO: Break down this large function into smaller functions */}
      {/* TODO: Reduce function complexity by extracting logic */}
      {/* eslint-disable-next-line complexity */}
      {content.items?.map((item: DropdownMenuItem, index: number) => {
        const hasChildren = !!item.children
        const Tag = hasChildren ? 'div' : item.isButton ? DropdownContentItemButton : undefined
        const extractedLabel = item.label
        const href = !hasChildren
          ? appendUtmParams(item.href!, item.utmSource, item.utmContent, rootDomain, !!item.external, extractedLabel)
          : undefined

        const content = (
          <>
            {item.icon && <DropdownContentItemIcon src={item.icon} alt="" />}
            <DropdownContentItemText>
              <DropdownContentItemTitle>
                <span>{extractedLabel}</span>
                {(item.badge || item.badgeImage) && (
                  <Badge {...(item.badgeType && { type: item.badgeType })}>
                    {item.badgeImage ? (
                      <SVG src={item.badgeImage} />
                    ) : isValidElement(item.badge) ? (
                      item.badge
                    ) : (
                      item.badge
                    )}
                  </Badge>
                )}
              </DropdownContentItemTitle>
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
  label: string | undefined,
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

interface SettingsDropdownProps {
  closeDropdown: () => void
  isOpen: boolean
  mobileMode: boolean
  navItems?: MenuItem[]
}

interface GlobalSettingsDropdownProps extends SettingsDropdownProps {
  LinkComponent: LinkComponentType
  rootDomain: string
}

// TODO: Break down this large function into smaller functions
const GlobalSettingsDropdown = forwardRef<HTMLUListElement, GlobalSettingsDropdownProps>((props, ref) => {
  const { mobileMode, navItems, isOpen, closeDropdown, rootDomain, LinkComponent } = props

  if (!navItems || navItems.length === 0) {
    return null
  }

  return (
    <>
      {isOpen &&
        (mobileMode ? (
          <MobileDropdownContainer mobileMode={mobileMode} ref={ref as unknown as React.RefObject<HTMLDivElement>}>
            <DropdownContent isOpen={true} alignRight={true} mobileMode={mobileMode}>
              {navItems.map((item, index) => {
                const extractedLabel = item.label
                const to = item.external
                  ? appendUtmParams(
                      item.href!,
                      item.utmSource,
                      item.utmContent,
                      rootDomain,
                      item.external,
                      extractedLabel,
                    )
                  : item.href
                    ? `${new URL(item.href, `https://${rootDomain}`).pathname}`
                    : undefined

                const content = (
                  <>
                    <DropdownContentItemText>
                      <DropdownContentItemTitle>{extractedLabel}</DropdownContentItemTitle>
                    </DropdownContentItemText>
                    <SVG src={IMG_ICON_ARROW_RIGHT} className="arrow-icon-right" />
                  </>
                )

                return (
                  <StyledDropdownContentItem key={index} onClick={_onDropdownItemClickFactory(item, closeDropdown)}>
                    {to ? <LinkComponent href={to}>{content}</LinkComponent> : <div>{content}</div>}
                  </StyledDropdownContentItem>
                )
              })}
            </DropdownContent>
          </MobileDropdownContainer>
        ) : (
          <DropdownContent isOpen={true} ref={ref} alignRight={true} mobileMode={mobileMode}>
            {navItems.map((item, index) => {
              const extractedLabel = item.label
              const to = item.external
                ? appendUtmParams(
                    item.href!,
                    item.utmSource,
                    item.utmContent,
                    rootDomain,
                    item.external,
                    extractedLabel,
                  )
                : item.href

              const content = (
                <>
                  <DropdownContentItemText>
                    <DropdownContentItemTitle>{extractedLabel}</DropdownContentItemTitle>
                  </DropdownContentItemText>
                  <SVG src={IMG_ICON_ARROW_RIGHT} className="arrow-icon-right" />
                </>
              )

              return (
                <StyledDropdownContentItem key={index} onClick={_onDropdownItemClickFactory(item, closeDropdown)}>
                  {to ? <LinkComponent href={to}>{content}</LinkComponent> : <div>{content}</div>}
                </StyledDropdownContentItem>
              )
            })}
          </DropdownContent>
        ))}
    </>
  )
})

// TODO: Break down this large function into smaller functions
const LanguagesDropdown = forwardRef<HTMLUListElement, SettingsDropdownProps>((props, ref) => {
  const { mobileMode, navItems, isOpen, closeDropdown } = props

  if (!navItems || navItems.length === 0) return null

  const dropdownContent = navItems.map((item, index) => {
    const content = (
      <>
        <DropdownContentItemText>
          <DropdownContentItemTitle>
            <span>{getFlag(item.label as string)}</span>
            <span>{getLanguageName(item.label as string)}</span>
          </DropdownContentItemTitle>
        </DropdownContentItemText>
        <SVG src={IMG_ICON_ARROW_RIGHT} className="arrow-icon-right" />
      </>
    )

    return (
      <StyledDropdownContentItem key={index} onClick={_onDropdownItemClickFactory(item, closeDropdown)}>
        <div>{content}</div>
      </StyledDropdownContentItem>
    )
  })

  return (
    <>
      {isOpen &&
        (mobileMode ? (
          <MobileDropdownContainer mobileMode={mobileMode} ref={ref as unknown as React.RefObject<HTMLDivElement>}>
            <DropdownContent isOpen={true} alignRight={true} mobileMode={mobileMode}>
              {dropdownContent}
            </DropdownContent>
          </MobileDropdownContainer>
        ) : (
          <DropdownContent isOpen={true} ref={ref} alignRight={true} mobileMode={mobileMode}>
            {dropdownContent}
          </DropdownContent>
        ))}
    </>
  )
})

function _onDropdownItemClickFactory(item: MenuItem, postClick?: () => void) {
  return (e: React.MouseEvent<HTMLElement>) => {
    if (item.onClick) {
      item.onClick(e as React.MouseEvent<HTMLButtonElement | HTMLDivElement>)
    }
    postClick?.()
  }
}

interface MenuBarProps {
  LinkComponent: LinkComponentType
  activeBackgroundDark?: string
  activeBackgroundLight?: string
  activeFillDark?: string
  activeFillLight?: string
  additionalContent?: React.ReactNode
  additionalNavButtons?: MenuItem[]
  bgColorDark?: string
  bgColorLight?: string
  bgDropdownColorDark?: string
  bgDropdownColorLight?: string
  colorDark?: string
  colorLight?: string
  customTheme?: CowSwapTheme
  defaultFillDark?: string
  defaultFillLight?: string
  hoverBackgroundDark?: string
  hoverBackgroundLight?: string
  id?: string
  languageNavItems?: MenuItem[]
  maxWidth?: number
  navItems: MenuItem[]
  padding?: string
  persistentAdditionalContent?: React.ReactNode
  productVariant: ProductVariant
  settingsNavItems?: MenuItem[]
  showGlobalSettings?: boolean
}

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, complexity, @typescript-eslint/explicit-function-return-type
export const MenuBar = (props: MenuBarProps) => {
  const {
    LinkComponent,
    activeBackgroundDark,
    activeBackgroundLight,
    activeFillDark,
    activeFillLight,
    additionalContent,
    additionalNavButtons,
    bgColorDark,
    bgColorLight,
    bgDropdownColorDark,
    bgDropdownColorLight,
    colorDark,
    colorLight,
    customTheme,
    defaultFillDark,
    defaultFillLight,
    hoverBackgroundDark,
    hoverBackgroundLight,
    id,
    languageNavItems,
    maxWidth,
    navItems,
    padding,
    persistentAdditionalContent,
    productVariant,
    settingsNavItems,
    showGlobalSettings,
  } = props

  const [isDaoOpen, setIsDaoOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLUListElement>(null)
  const mobileMenuTriggerRef = useRef<HTMLDivElement>(null)
  const navItemsRef = useRef<HTMLUListElement>(null)
  const settingsButtonRef = useRef<HTMLButtonElement>(null)
  const settingsDropdownRef = useRef<HTMLUListElement>(null)
  const languageButtonRef = useRef<HTMLButtonElement>(null)
  const languageDropdownRef = useRef<HTMLUListElement>(null)

  const rootDomain = typeof window !== 'undefined' ? window.location.host : ''

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleSettingsToggle = () => setIsSettingsOpen((prev) => !prev)

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleLanguageToggle = () => setIsLanguageOpen((prev) => !prev)

  const isMobile = useMediaQuery(Media.upToLarge(false))
  const isMedium = useMediaQuery(Media.upToMedium(false))

  useOnClickOutside([menuRef], () => setIsDaoOpen(false))

  useOnClickOutside(isMobile ? [mobileMenuRef] : [navItemsRef], () => setOpenDropdown(null))

  useOnClickOutside([mobileMenuRef, mobileMenuTriggerRef], () => setIsMobileMenuOpen(false))

  useOnClickOutside([settingsButtonRef, settingsDropdownRef], () => setIsSettingsOpen(false))

  useOnClickOutside([languageButtonRef, languageDropdownRef], () => setIsLanguageOpen(false))

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleMobileMenuToggle = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setIsMobileMenuOpen((prev) => !prev)
  }

  React.useEffect(() => {
    if (isMobile) {
      if (isMobileMenuOpen || isDaoOpen || isSettingsOpen || isLanguageOpen) {
        addBodyClass('noScroll')
      } else {
        removeBodyClass('noScroll')
      }
    }

    return () => {
      removeBodyClass('noScroll')
    }
  }, [isMobile, isMobileMenuOpen, isDaoOpen, isSettingsOpen, isLanguageOpen])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <MenuBarWrapper
      id={id}
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
          mobileMode={isMedium}
          rootDomain={rootDomain}
          LinkComponent={LinkComponent}
        />
        <ProductLogo variant={productVariant} logoIconOnly={isMobile} height={30} href="/" theme={customTheme} />

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

        <RightAligned mobileMode={isMedium} flexFlowMobile="row wrap">
          {persistentAdditionalContent} {/* Always render this content */}
          {!isMedium && additionalContent} {/* Render this content only on desktop */}
          {!isMedium &&
            isLoaded &&
            additionalNavButtons &&
            additionalNavButtons.map((item, index) => {
              const extractedLabel = item.label
              const href = item.external
                ? appendUtmParams(
                    item.href!,
                    item.utmSource,
                    item.utmContent,
                    rootDomain,
                    item.external,
                    extractedLabel,
                  )
                : item.href

              if (!href) return null

              return (
                <DropdownContentItemButton
                  key={index}
                  bgColor={item.bgColor}
                  color={item.color}
                  hoverBgColor={item.hoverBgColor}
                  hoverColor={item.hoverColor}
                  mobileMode={isMedium}
                  as={item.isButton ? 'button' : 'div'}
                >
                  <LinkComponent href={href}>
                    <DropdownContentItemText>
                      <DropdownContentItemTitle>{extractedLabel}</DropdownContentItemTitle>
                    </DropdownContentItemText>
                    <SVG src={IMG_ICON_ARROW_RIGHT} className={`arrow-icon-right ${item.external ? 'external' : ''}`} />
                  </LinkComponent>
                </DropdownContentItemButton>
              )
            })}
          {languageNavItems && isLinguiInternationalizationEnabled && (
            <LanguagesDropdownWrapper>
              <LanguageSettingsButton ref={languageButtonRef} mobileMode={isMedium} onClick={handleLanguageToggle}>
                {getFlag(i18n.locale)}
              </LanguageSettingsButton>
              {isLanguageOpen && (
                <LanguagesDropdown
                  closeDropdown={handleLanguageToggle}
                  isOpen={isLanguageOpen}
                  mobileMode={isMedium}
                  ref={languageDropdownRef}
                  navItems={languageNavItems}
                />
              )}
            </LanguagesDropdownWrapper>
          )}
          {showGlobalSettings && settingsNavItems && (
            <>
              <GlobalSettingsButton ref={settingsButtonRef} mobileMode={isMedium} onClick={handleSettingsToggle}>
                <SVG src={IMG_ICON_SETTINGS_GLOBAL} />
              </GlobalSettingsButton>
              {isSettingsOpen && (
                <GlobalSettingsDropdown
                  mobileMode={isMedium}
                  navItems={settingsNavItems}
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
                additionalNavButtons.map((item, index) => {
                  const extractedLabel = item.label
                  return (
                    <DropdownContentItemButton
                      key={index}
                      bgColor={item.bgColor}
                      color={item.color}
                      hoverBgColor={item.hoverBgColor}
                      hoverColor={item.hoverColor}
                      as={item.isButton ? 'button' : 'div'}
                    >
                      <LinkComponent
                        href={appendUtmParams(
                          item.href!,
                          item.utmSource,
                          item.utmContent,
                          rootDomain,
                          !!item.external,
                          extractedLabel,
                        )}
                      >
                        <DropdownContentItemText>
                          <DropdownContentItemTitle>{extractedLabel}</DropdownContentItemTitle>
                        </DropdownContentItemText>
                        <SVG
                          src={IMG_ICON_ARROW_RIGHT}
                          className={`arrow-icon-right ${item.external ? 'external' : ''}`}
                        />
                      </LinkComponent>
                    </DropdownContentItemButton>
                  )
                })}
            </RightAligned>
          </div>
        </NavItems>
      )}
    </MenuBarWrapper>
  )
}
