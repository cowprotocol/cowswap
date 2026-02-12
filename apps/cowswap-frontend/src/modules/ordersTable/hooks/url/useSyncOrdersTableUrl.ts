import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useSetAtom, useAtomValue } from 'jotai'

import { ordersTableUrlSearchAtom, ordersTableUrlSyncEffectAtom } from '../../state/ordersTable.atoms'

/**
 * Pushes current location.search into ordersTableUrlSearchAtom and mounts the URL→filters sync effect.
 * Use once when the orders table widget is mounted so that tab (and page) URL params drive filter state.
 */
export function useSyncOrdersTableUrl(): void {
  const location = useLocation()
  const setUrlSearch = useSetAtom(ordersTableUrlSearchAtom)

  useAtomValue(ordersTableUrlSyncEffectAtom)

  useEffect(() => {
    setUrlSearch(location.search)
  }, [location.search, setUrlSearch])
}
