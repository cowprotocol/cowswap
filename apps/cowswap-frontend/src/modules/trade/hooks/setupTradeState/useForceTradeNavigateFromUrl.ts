import { useEffect } from 'react'

import { useLocation } from 'react-router'

import { useNavigate } from 'common/hooks/useNavigate'
import { TRADE_URL_FORCE_NAVIGATE_KEY } from 'common/modules/tradeNavigation'

/**
 * Returns true when URL contains the force navigate flag, and removes the flag from URL right after
 */
export function useForceTradeNavigateFromUrl(): boolean {
  const { search } = useLocation()
  const navigate = useNavigate()
  const isForceTradeNavigate = new URLSearchParams(search).has(TRADE_URL_FORCE_NAVIGATE_KEY)

  useEffect(() => {
    if (!isForceTradeNavigate) return

    // Browser API instead of useLocation(): other params cleanups (useSetupTradeAmountsFromUrl) can update URL in between
    const [pathname, query] = window.location.hash.split('?')

    if (!query) return

    const queryParams = new URLSearchParams(query)

    if (!queryParams.has(TRADE_URL_FORCE_NAVIGATE_KEY)) return

    queryParams.delete(TRADE_URL_FORCE_NAVIGATE_KEY)

    navigate({ pathname: pathname.slice(1), search: queryParams.toString() }, { replace: true })
  }, [isForceTradeNavigate, navigate])

  return isForceTradeNavigate
}
