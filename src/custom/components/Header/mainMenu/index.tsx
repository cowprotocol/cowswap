import { useMemo } from 'react'
import { HeaderLinks as Wrapper, StyledNavLink } from '../styled'
import { ExternalLink } from 'theme/components'
import MenuDropdown from 'components/MenuDropdown'
import { MenuTitle, MenuSection } from 'components/MenuDropdown/styled'
import SVG from 'react-inlinesvg'
import { MAIN_MENU, MAIN_MENU_TYPE } from 'constants/mainMenu'

// Assets
import IMAGE_MOON from 'assets/cow-swap/moon.svg'
import IMAGE_SUN from 'assets/cow-swap/sun.svg'

const getLinkComponent = {
  internal: StyledNavLink,
  external: ExternalLink,
}

interface LinkType {
  title: MAIN_MENU_TYPE['title']
  externalURL?: boolean
  index: number
  url: string
  icon?: string
  iconSVG?: string
  handleMobileMenuOnClick: () => void
}

// Dynamic util function to render links based on internal or external type (with or without icon image)
function getLink({ title, externalURL, index, url, iconSVG, icon, handleMobileMenuOnClick }: LinkType) {
  const LinkComponent = externalURL ? getLinkComponent.external : getLinkComponent.internal
  return (
    <LinkComponent
      key={index}
      exact
      to={url}
      href={url}
      onClick={handleMobileMenuOnClick}
      onClickOptional={handleMobileMenuOnClick}
    >
      {iconSVG ? (
        <SVG src={iconSVG} description={`${title} icon`} />
      ) : icon ? (
        <img src={icon} alt={`${title} icon`} />
      ) : null}{' '}
      {title}
    </LinkComponent>
  )
}

interface DarkModeButtonType {
  index: number
  darkMode: boolean
  toggleDarkMode: () => void
  handleMobileMenuOnClick: () => void
}

const getDarkModeButton = ({ index, darkMode, toggleDarkMode, handleMobileMenuOnClick }: DarkModeButtonType) => {
  return (
    <button
      key={index}
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

interface DropdownType {
  index: number
  handleMobileMenuOnClick: () => void
  darkMode: boolean
  toggleDarkMode: () => void
  title: MAIN_MENU_TYPE['title']
  items: MAIN_MENU_TYPE['items']
}

const getDropdown = ({ index, title, handleMobileMenuOnClick, toggleDarkMode, darkMode, items }: DropdownType) => (
  <MenuDropdown key={index} title={title}>
    {items &&
      items.map(({ sectionTitle, links }, index) => {
        return (
          <MenuSection key={index}>
            {sectionTitle && <MenuTitle>{sectionTitle}</MenuTitle>}

            {links.map(({ title, url, externalURL, icon, iconSVG, action }, index) => (
              <>
                {!url &&
                  action &&
                  action === 'setColorMode' &&
                  getDarkModeButton({ index, darkMode, toggleDarkMode, handleMobileMenuOnClick })}
                {!action &&
                  url &&
                  title &&
                  getLink({ title, externalURL, index, url, handleMobileMenuOnClick, icon, iconSVG })}
              </>
            ))}
          </MenuSection>
        )
      })}
  </MenuDropdown>
)

export interface MainMenuProps {
  isMobileMenuOpen: boolean
  darkMode: boolean
  toggleDarkMode: () => void
  handleMobileMenuOnClick: () => void
}

export default function MainMenu({
  isMobileMenuOpen,
  darkMode,
  toggleDarkMode,
  handleMobileMenuOnClick,
}: MainMenuProps) {
  const getMainMenu = useMemo(
    () =>
      MAIN_MENU.map(({ title, url, externalURL, items }: MAIN_MENU_TYPE, index) => (
        <>
          {/* 1st level main menu item: No dropdown items */}
          {!items && url && getLink({ title, externalURL, index, url, handleMobileMenuOnClick })}

          {/* 1st level main menu item: Has dropdown items */}
          {items && getDropdown({ index, title, handleMobileMenuOnClick, toggleDarkMode, darkMode, items })}
        </>
      )),
    [darkMode, handleMobileMenuOnClick, toggleDarkMode]
  )

  return <Wrapper isMobileMenuOpen={isMobileMenuOpen}>{getMainMenu}</Wrapper>
}
