import { useLayoutEffect } from 'react'

import { useLocation } from 'react-router'

import { useCloseAccountModal } from './useToggleAccountModal'

/**
 * Every time the url changes, closes the account modal
 * If it's not open it has no effect
 */
export function useCloseAccountModalOnNavigate(): null {
  const location = useLocation()
  const closeAccountModal = useCloseAccountModal()

  useLayoutEffect(() => {
    closeAccountModal()
  }, [location.pathname, closeAccountModal])

  return null
}
