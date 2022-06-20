import { HeaderLinks as Wrapper, StyledNavLink } from '../styled'
import MenuDropdown from 'components/MenuDropdown'
import { MenuTitle, MenuSection } from 'components/MenuDropdown/styled'
import SVG from 'react-inlinesvg'
import { MAIN_MENU, MAIN_MENU_TYPE } from 'constants/mainMenu'
import { ExternalLink } from 'theme/components'

// Assets
import IMAGE_MOON from 'assets/cow-swap/moon.svg'
import IMAGE_SUN from 'assets/cow-swap/sun.svg'

interface MainMenuItem {
  title: string
  url?: string
  externalURL?: boolean
  items?: {
    sectionTitle?: string
    links: {
      title?: string
      url?: string // If URL is an internal route
      externalURL?: boolean // If URL is external
      icon?: string // If icon uses a regular <img /> tag
      iconSVG?: string // If icon is a <SVG> inline component
      action?: string // Special purpose flag for non-regular links
    }[]
  }[]
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
function MenuItem({ title, externalURL, index, url, iconSVG, icon, handleMobileMenuOnClick }: LinkType) {
  const menuImage = <MenuImage title={title} icon={icon} iconSVG={iconSVG} />

  return externalURL ? (
    <ExternalLink key={index} href={url} onClickOptional={handleMobileMenuOnClick}>
      {menuImage}
      {title}
    </ExternalLink>
  ) : (
    <StyledNavLink key={index} exact to={url} onClick={handleMobileMenuOnClick}>
      {menuImage}
      {title}
    </StyledNavLink>
  )
}

interface DarkModeButtonProps {
  index: number
  darkMode: boolean
  toggleDarkMode: () => void
  handleMobileMenuOnClick: () => void
}

const DarkModeButton = ({ index, darkMode, toggleDarkMode, handleMobileMenuOnClick }: DarkModeButtonProps) => {
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

interface DropdownProps {
  index: number
  handleMobileMenuOnClick: () => void
  darkMode: boolean
  toggleDarkMode: () => void
  title: MAIN_MENU_TYPE['title']
  items: MAIN_MENU_TYPE['items']
}

const DropDown = ({ index, title, handleMobileMenuOnClick, toggleDarkMode, darkMode, items }: DropdownProps) => (
  <MenuDropdown key={index} title={title}>
    {items?.map(({ sectionTitle, links }, index) => {
      return (
        <MenuSection key={index}>
          {sectionTitle && <MenuTitle>{sectionTitle}</MenuTitle>}

          {links.map(({ title, url, externalURL, icon, iconSVG, action }, index) => (
            <>
              {!url &&
                action &&
                action === 'setColorMode' &&
                DarkModeButton({ index, darkMode, toggleDarkMode, handleMobileMenuOnClick })}
              {!action &&
                url &&
                title &&
                MenuItem({ title, externalURL, index, url, handleMobileMenuOnClick, icon, iconSVG })}
            </>
          ))}
        </MenuSection>
      )
    })}
  </MenuDropdown>
)

function MenuItemWithDropDown() {
  return (
    <>
      {/* 1st level main menu item: No dropdown items */}
      {!items && url && MenuItem({ title, externalURL, index, url, handleMobileMenuOnClick })}

      {/* 1st level main menu item: Has dropdown items */}
      {items && DropDown({ index, title, handleMobileMenuOnClick, toggleDarkMode, darkMode, items })}
    </>
  )
}

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
  return (
    <Wrapper isMobileMenuOpen={isMobileMenuOpen}>
      {MAIN_MENU.map(({ title, url, externalURL, items }: MAIN_MENU_TYPE, index) => (
        <>
          {/* 1st level main menu item: No dropdown items */}
          {!items && url && MenuItem({ title, externalURL, index, url, handleMobileMenuOnClick })}

          {/* 1st level main menu item: Has dropdown items */}
          {items && DropDown({ index, title, handleMobileMenuOnClick, toggleDarkMode, darkMode, items })}
        </>
      ))}
    </Wrapper>
  )
}
