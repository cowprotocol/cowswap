import IMAGE_MOON from '@cowprotocol/assets/cow-swap/moon.svg'
import IMAGE_SUN from '@cowprotocol/assets/cow-swap/sun.svg'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import AppziButton from 'legacy/components/AppziButton'
import { HeaderLinks as Wrapper, StyledNavLink } from 'legacy/components/Header/styled'
import MenuDropdown from 'legacy/components/MenuDropdown'
import { MenuSection, MenuTitle } from 'legacy/components/MenuDropdown/styled'
import { upToMedium, useMediaQuery } from 'legacy/hooks/useMediaQuery'

import { FortuneWidget } from 'modules/fortune/containers/FortuneWidget'
import {
  CustomItem,
  DropDownItem,
  ExternalLink,
  InternalLink,
  MainMenuContext,
  MenuItemKind,
  MenuLink,
  MenuTreeItem,
  ParametrizedLink,
} from 'modules/mainMenu/types'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'

import { RoutesValues } from 'common/constants/routes'
import { FeatureGuard } from 'common/containers/FeatureGuard'

import { MenuBadge, StyledExternalLink } from './styled'

import { MAIN_MENU } from '../../constants/mainMenu'

const ExtraMenuItemsWrapper = styled.div<{ isVisible: boolean; isUpToMedium: boolean }>`
  display: ${({ isVisible, isUpToMedium }) => (isVisible && isUpToMedium ? 'block' : 'none')};
  width: 100%;
`

interface MenuImageProps {
  title: string
  iconSVG?: string
  icon?: string
}

function MenuImage(props: MenuImageProps) {
  const { title, iconSVG, icon } = props

  if (iconSVG) {
    return <SVG src={iconSVG} description={`${title} icon`} />
  } else if (icon) {
    return <img src={icon} alt={`${title} icon`} />
  } else {
    return null
  }
}

interface InternalExternalLinkProps {
  link: InternalLink | ExternalLink | ParametrizedLink | CustomItem
  context: MainMenuContext
}

function Link({ link, context }: InternalExternalLinkProps) {
  if (link.kind === MenuItemKind.CUSTOM_ITEM) {
    const { Item: LinkComponent } = link
    return <>{LinkComponent()}</>
  }

  const { kind, title, url, iconSVG, icon, badge } = link
  const menuImage = <MenuImage title={title} icon={icon} iconSVG={iconSVG} />
  const isExternal = kind === MenuItemKind.EXTERNAL_LINK
  const isDynamic = kind === MenuItemKind.PARAMETRIZED_LINK
  const { handleMobileMenuOnClick, tradeContext } = context
  const internalUrl = isDynamic ? parameterizeTradeRoute(tradeContext, url as RoutesValues) : url

  if (isExternal) {
    return (
      <StyledExternalLink href={url} onClickOptional={handleMobileMenuOnClick}>
        {menuImage}
        <span>{title}</span>
        {badge && <MenuBadge>{badge}</MenuBadge>}
      </StyledExternalLink>
    )
  }

  return (
    <StyledNavLink to={internalUrl} end onClick={handleMobileMenuOnClick}>
      {menuImage}
      {title}
      {badge && <MenuBadge>{badge}</MenuBadge>}
    </StyledNavLink>
  )
}

type DarkModeButtonProps = {
  context: MainMenuContext
}

function DarkModeButton({ context }: DarkModeButtonProps) {
  const { darkMode, toggleDarkMode, handleMobileMenuOnClick } = context
  const description = `${darkMode ? 'Sun/light' : 'Moon/dark'} mode icon`
  const label = (darkMode ? 'Light' : 'Dark') + ' Mode'

  return (
    <button
      onClick={() => {
        handleMobileMenuOnClick()
        toggleDarkMode()
      }}
    >
      <SVG src={darkMode ? IMAGE_SUN : IMAGE_MOON} description={description} /> {label}
    </button>
  )
}

interface LinkProps {
  link: MenuLink
  context: MainMenuContext
}

function DropdownLink({ link, context }: LinkProps) {
  switch (link.kind) {
    case MenuItemKind.DARK_MODE_BUTTON:
      return <DarkModeButton context={context} />

    default:
      return <Link link={link} context={context} />
  }
}

interface DropdownProps {
  item: DropDownItem
  context: MainMenuContext
}

const DropDown = ({ item, context }: DropdownProps) => {
  const { title, items, badge } = item

  return (
    <MenuDropdown title={title} badge={badge}>
      {items?.map((item, index) => {
        const { sectionTitle, links } = item
        return (
          <MenuSection key={index}>
            {sectionTitle && <MenuTitle>{sectionTitle}</MenuTitle>}
            {links.map((link, linkIndex) => (
              <DropdownLink key={linkIndex} link={link} context={context} />
            ))}
          </MenuSection>
        )
      })}
    </MenuDropdown>
  )
}

interface MenuItemWithDropDownProps {
  menuItem: MenuTreeItem
  context: MainMenuContext
}

function MenuItemWithDropDown(props: MenuItemWithDropDownProps) {
  const { menuItem, context } = props

  switch (menuItem.kind) {
    case MenuItemKind.DROP_DOWN:
      return <DropDown item={menuItem} context={context} />

    case undefined: // INTERNAL
    case MenuItemKind.PARAMETRIZED_LINK:
    case MenuItemKind.EXTERNAL_LINK:
      // Render Internal/External links
      return <Link link={menuItem} context={context} />
    case MenuItemKind.CUSTOM_ITEM:
      return <>{menuItem.Item}</>
    default:
      return null
  }
}

export interface MenuTreeProps {
  items?: MenuTreeItem[]
  context: MainMenuContext
  isMobileMenuOpen: boolean
  handleMobileMenuOnClick(): void
}

export function MenuTree({ items = MAIN_MENU, isMobileMenuOpen, context, handleMobileMenuOnClick }: MenuTreeProps) {
  const isUpToMedium = useMediaQuery(upToMedium)

  return (
    <Wrapper isMobileMenuOpen={isMobileMenuOpen}>
      {items.map((menuItem, index) => {
        return <MenuItemWithDropDown key={index} menuItem={menuItem} context={context} />
      })}
      {/* Medium and down only to show the fortune widget and feedback button */}
      {isUpToMedium && isMobileMenuOpen && (
        <ExtraMenuItemsWrapper isVisible={isMobileMenuOpen} isUpToMedium={isUpToMedium}>
          <FeatureGuard featureFlag="cowFortuneEnabled">
            <FortuneWidget menuTitle="Get your fortune cookie" isMobileMenuOpen={isMobileMenuOpen} />
          </FeatureGuard>

          <AppziButton menuTitle="Give us feedback" onClick={handleMobileMenuOnClick} isUpToMedium={isUpToMedium} />
        </ExtraMenuItemsWrapper>
      )}
    </Wrapper>
  )
}
