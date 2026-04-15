import { useAtom } from 'jotai'
import { ReactElement, RefObject, useCallback, useEffect, useRef } from 'react'

import { useMenuButtonContext } from '@reach/menu-button'

import { settingsTabStateAtom } from '../../state/settingsTabState'

interface SettingsTabControllerProps {
  buttonRef: RefObject<HTMLButtonElement | null>
  children: ReactElement
}

/**
 * Syncs settingsTabState.open (e.g. from "Edit" in slippage row) with Reach Menu:
 * when open becomes true we programmatically open the menu, then clear the flag
 * only after the menu has expanded to avoid double-toggle races.
 *
 * @see https://stackoverflow.com/questions/70596487/how-to-programmatically-expand-react-reach-ui-reach-menu-button-menu
 */
export function SettingsTabController({ buttonRef, children }: SettingsTabControllerProps): ReactElement {
  const [settingsTabState, setSettingsTabState] = useAtom(settingsTabStateAtom)
  const { isExpanded } = useMenuButtonContext()

  /** Ensures we only fire one open (toggleMenu) per open=true; prevents double-toggle when both effects would run. */
  const hasRequestedOpen = useRef(false)

  /** Simulates a click on the menu button so Reach Menu opens/closes. */
  const toggleMenu = useCallback(() => {
    buttonRef.current?.dispatchEvent(new Event('mousedown', { bubbles: true }))
  }, [buttonRef])

  useEffect(() => {
    // No open request: reset ref so next open request will trigger one toggle.
    if (!settingsTabState.open) {
      hasRequestedOpen.current = false
      return
    }

    // Menu is already expanded: clear the request flag so we don't toggle again on re-renders.
    if (isExpanded) {
      setSettingsTabState({ open: false })
      hasRequestedOpen.current = false
      return
    }

    // Open requested but menu not expanded yet: fire open once, then wait for isExpanded to become true.
    if (!hasRequestedOpen.current) {
      hasRequestedOpen.current = true
      toggleMenu()
    }
  }, [settingsTabState.open, isExpanded, toggleMenu, setSettingsTabState])

  return children
}
