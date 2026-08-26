import { useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'

import { useLocation } from 'react-router'

import { assistantDrawerOpenAtom } from '../state/drawerAtom'

/** Opens the drawer on load, so a shared link shows the assistant without hunting. */
const OPEN_ON_LOAD_PARAM = 'assistant'

export interface AssistantDrawerState {
  close(): void
  isOpen: boolean
  toggle(): void
}

export function useAssistantDrawer(): AssistantDrawerState {
  const [isOpen, setIsOpen] = useAtom(assistantDrawerOpenAtom)
  const { search } = useLocation()

  // `?assistant=1` opens it on arrival. This is what makes an evaluation link
  // land on the feature rather than on a button someone has to find, while the
  // app stays untouched for everyone else.
  useEffect(() => {
    if (new URLSearchParams(search).get(OPEN_ON_LOAD_PARAM) === '1') setIsOpen(true)
    // Deliberately only on mount: re-running would reopen the drawer every time
    // the trade route changes its search params, which is constantly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = useCallback(() => setIsOpen((open) => !open), [setIsOpen])
  const close = useCallback(() => setIsOpen(false), [setIsOpen])

  return { isOpen, toggle, close }
}
