import { HeaderLinks as Wrapper, StyledNavLink } from '../styled'
import MenuDropdown from 'components/MenuDropdown'
import { MenuTitle, MenuSection } from 'components/MenuDropdown/styled'
import SVG from 'react-inlinesvg'
import {
  MAIN_MENU,
  MenuTreeItem,
  MenuItemKind,
  InternalLink,
  ExternalLink,
  DropDownItem,
  MenuLink,
} from 'constants/mainMenu'
import { ExternalLink as ExternalLinkComponent } from 'theme/components'

// Assets
import IMAGE_MOON from 'assets/cow-swap/moon.svg'
import IMAGE_SUN from 'assets/cow-swap/sun.svg'

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
  link: InternalLink | ExternalLink
  handleMobileMenuOnClick: () => void
}

function InternalExternalLink({ link, handleMobileMenuOnClick }: InternalExternalLinkProps) {
  const { kind, title, url, iconSVG, icon } = link
  const menuImage = <MenuImage title={title} icon={icon} iconSVG={iconSVG} />
  const isExternal = kind === MenuItemKind.EXTERNAL_LINK

  if (isExternal) {
    return (
      <ExternalLinkComponent href={url} onClickOptional={handleMobileMenuOnClick}>
        {menuImage}
        {title}
      </ExternalLinkComponent>
    )
  } else {
    return (
      <StyledNavLink exact to={url} onClick={handleMobileMenuOnClick}>
        {menuImage}
        {title}
      </StyledNavLink>
    )
  }
}

interface ContextProps {
  darkMode: boolean
  toggleDarkMode: () => void
  handleMobileMenuOnClick: () => void
}

type DarkModeButtonProps = {
  context: ContextProps
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
  context: ContextProps
}

function Link({ link, context }: LinkProps) {
  switch (link.kind) {
    case MenuItemKind.DARK_MODE_BUTTON:
      return <DarkModeButton context={context} />

    default:
      return <InternalExternalLink link={link} handleMobileMenuOnClick={context.handleMobileMenuOnClick} />
  }
}

interface DropdownProps {
  item: DropDownItem
  context: ContextProps
}

const DropDown = ({ item, context }: DropdownProps) => {
  const { title, items } = item

  return (
    <MenuDropdown title={title}>
      {items?.map((item, index) => {
        const { sectionTitle, links } = item
        return (
          <MenuSection key={index}>
            {sectionTitle && <MenuTitle>{sectionTitle}</MenuTitle>}
            {links.map((link, linkIndex) => (
              <Link key={linkIndex} link={link} context={context} />
            ))}
          </MenuSection>
        )
      })}
    </MenuDropdown>
  )
}

interface MenuItemWithDropDownProps {
  menuItem: MenuTreeItem
  context: ContextProps
}

function MenuItemWithDropDown(props: MenuItemWithDropDownProps) {
  const { menuItem, context } = props

  switch (menuItem.kind) {
    case MenuItemKind.DROP_DOWN:
      return <DropDown item={menuItem} context={context} />

    case undefined: // INTERNAL
    case MenuItemKind.EXTERNAL_LINK: // EXTERNAL
      // Render Internal/External links
      return <InternalExternalLink link={menuItem} handleMobileMenuOnClick={context.handleMobileMenuOnClick} />
    default:
      return null
  }
}

export interface MenuTreeProps extends ContextProps {
  isMobileMenuOpen: boolean
}

export function MenuTree({ isMobileMenuOpen, darkMode, toggleDarkMode, handleMobileMenuOnClick }: MenuTreeProps) {
  const context = { darkMode, toggleDarkMode, handleMobileMenuOnClick }
  return (
    <Wrapper isMobileMenuOpen={isMobileMenuOpen}>
      {MAIN_MENU.map((menuItem, index) => (
        <MenuItemWithDropDown key={index} menuItem={menuItem} context={context} />
      ))}
    </Wrapper>
  )
}
