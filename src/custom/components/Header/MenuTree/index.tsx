import { HeaderLinks as Wrapper, StyledNavLink } from '../styled'
import MenuDropdown from 'components/MenuDropdown'
import { MenuTitle, MenuSection } from 'components/MenuDropdown/styled'
import SVG from 'react-inlinesvg'
import { MAIN_MENU, MenuLink, MenuTreeItem, MenuTreeSubItem } from 'constants/mainMenu'
import { ExternalLink } from 'theme/components'

// Assets
import IMAGE_MOON from 'assets/cow-swap/moon.svg'
import IMAGE_SUN from 'assets/cow-swap/sun.svg'

interface MenuItemProps {
  title: string
  externalURL?: boolean
  url: string
  icon?: string
  iconSVG?: string
  handleMobileMenuOnClick: () => void
}

function MenuImage(props: { title: string; iconSVG?: string; icon?: string }) {
  const { title, iconSVG, icon } = props

  if (iconSVG) {
    return <SVG src={iconSVG} description={`${title} icon`} />
  } else if (icon) {
    return <img src={icon} alt={`${title} icon`} />
  } else {
    return null
  }
}

// Dynamic util function to render links based on internal or external type (with or without icon image)
function MenuItem({ title, externalURL, url, iconSVG, icon, handleMobileMenuOnClick }: MenuItemProps) {
  const menuImage = <MenuImage title={title} icon={icon} iconSVG={iconSVG} />

  return externalURL ? (
    <ExternalLink href={url} onClickOptional={handleMobileMenuOnClick}>
      {menuImage}
      {title}
    </ExternalLink>
  ) : (
    <StyledNavLink exact to={url} onClick={handleMobileMenuOnClick}>
      {menuImage}
      {title}
    </StyledNavLink>
  )
}

interface DarkModeButtonProps {
  darkMode: boolean
  toggleDarkMode: () => void
  handleMobileMenuOnClick: () => void
}

const DarkModeButton = ({ darkMode, toggleDarkMode, handleMobileMenuOnClick }: DarkModeButtonProps) => {
  return (
    <button
      onClick={() => {
        handleMobileMenuOnClick()
        toggleDarkMode()
      }}
    >
      <SVG src={darkMode ? IMAGE_SUN : IMAGE_MOON} description={`${darkMode ? 'Sun/light' : 'Moon/dark'} mode icon`} />{' '}
      {darkMode ? 'Light' : 'Dark'} Mode
    </button>
  )
}

interface DropDownItemProps {
  link: MenuLink
  darkMode: boolean
  handleMobileMenuOnClick: () => void
  toggleDarkMode: () => void
}

function DropDownItem({ link, darkMode, handleMobileMenuOnClick, toggleDarkMode }: DropDownItemProps) {
  const { title, url, externalURL, icon, iconSVG, action } = link
  return (
    <>
      {!url &&
        action &&
        action === 'setColorMode' &&
        DarkModeButton({ darkMode, toggleDarkMode, handleMobileMenuOnClick })}
      {!action && url && title && MenuItem({ title, externalURL, url, handleMobileMenuOnClick, icon, iconSVG })}
    </>
  )
}

interface DropdownProps {
  title: string
  darkMode: boolean
  items: MenuTreeSubItem[]
  handleMobileMenuOnClick: () => void
  toggleDarkMode: () => void
}

const DropDown = (props: DropdownProps) => {
  const { title, handleMobileMenuOnClick, toggleDarkMode, darkMode, items } = props

  return (
    <MenuDropdown title={title}>
      {items?.map(({ sectionTitle, links }, index) => {
        return (
          <MenuSection key={index}>
            {sectionTitle && <MenuTitle>{sectionTitle}</MenuTitle>}
            {links.map((link, index) => (
              <DropDownItem
                key={index}
                link={link}
                handleMobileMenuOnClick={handleMobileMenuOnClick}
                toggleDarkMode={toggleDarkMode}
                darkMode={darkMode}
              />
            ))}
          </MenuSection>
        )
      })}
    </MenuDropdown>
  )
}

interface MenuItemWithDropDownProps {
  menuItem: MenuTreeItem

  darkMode: boolean
  toggleDarkMode: () => void
  handleMobileMenuOnClick: () => void
}

function MenuItemWithDropDown(props: MenuItemWithDropDownProps) {
  const { menuItem, darkMode, toggleDarkMode, handleMobileMenuOnClick } = props
  const { title, externalURL, url, items } = menuItem
  return (
    <>
      {/* 1st level main menu item: No dropdown items */}
      {!items && url && MenuItem({ title, externalURL, url, handleMobileMenuOnClick })}

      {/* 1st level main menu item: Has dropdown items */}
      {items && DropDown({ title, handleMobileMenuOnClick, toggleDarkMode, darkMode, items })}
    </>
  )
}

export interface MenuTreeProps {
  isMobileMenuOpen: boolean

  darkMode: boolean
  toggleDarkMode: () => void
  handleMobileMenuOnClick: () => void
}

export function MenuTree({ isMobileMenuOpen, darkMode, toggleDarkMode, handleMobileMenuOnClick }: MenuTreeProps) {
  const otherProps = { darkMode, toggleDarkMode, handleMobileMenuOnClick }
  return (
    <Wrapper isMobileMenuOpen={isMobileMenuOpen}>
      {MAIN_MENU.map((menuItem, index) => (
        <MenuItemWithDropDown key={index} menuItem={menuItem} {...otherProps} />
      ))}
    </Wrapper>
  )
}
