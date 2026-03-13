import { useAtom } from 'jotai'
import { ReactElement, RefObject, useCallback, useEffect } from 'react'

import { useMenuButtonContext } from '@reach/menu-button'

import { settingsTabStateAtom } from '../../state/settingsTabState'

interface SettingsTabControllerProps {
  buttonRef: RefObject<HTMLButtonElement | null>
  children: ReactElement
}

/**
 * https://stackoverflow.com/questions/70596487/how-to-programmatically-expand-react-reach-ui-reach-menu-button-menu
 */
export function SettingsTabController({ buttonRef, children }: SettingsTabControllerProps): ReactElement {
  const [settingsTabState, setSettingsTabState] = useAtom(settingsTabStateAtom)
  const { isExpanded } = useMenuButtonContext()

  const toggleMenu = useCallback(() => {
    buttonRef.current?.dispatchEvent(new Event('mousedown', { bubbles: true }))
  }, [buttonRef])

  useEffect(() => {
    if (settingsTabState.open) {
      toggleMenu()
    }
  }, [settingsTabState.open, toggleMenu])

  useEffect(() => {
    if (settingsTabState.open && !isExpanded) {
      toggleMenu()
      setSettingsTabState({ open: false })
    }
  }, [settingsTabState.open, isExpanded, toggleMenu, setSettingsTabState])

  return children
}
