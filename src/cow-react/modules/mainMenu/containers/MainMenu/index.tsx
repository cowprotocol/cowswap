import { useAtomValue } from 'jotai/utils'
import { MenuTree } from '../../pure/MenuTree'
import { mainMenuUrlOverridesAtom } from '../../state/mainMenuUrlOverridesAtom'
import { MAIN_MENU } from '../../constants/mainMenu'

export interface MainMenuProps {
  isMobileMenuOpen: boolean
  darkMode: boolean
  toggleDarkMode(): void
  handleMobileMenuOnClick(): void
}

export function MainMenu(props: MainMenuProps) {
  const mainMenuUrlOverrides = useAtomValue(mainMenuUrlOverridesAtom)

  return <MenuTree items={MAIN_MENU} itemsOverrides={mainMenuUrlOverrides} {...props} />
}
