import { atom } from 'jotai'

import { balancesAtom, balancesUpdateAtom } from './balancesAtom'
import { balancesWatcherHealthAtom } from './balancesWatcherHealthAtom'

/**
 * Whether the balances are fetched, so a missing balance means a zero one.
 * `hasFirstLoad` alone is not enough: the watcher fallback sets it before the multicall fallback has fetched anything.
 */
export const areBalancesLoadedAtom = atom((get) => {
  const { hasFirstLoad, chainId } = get(balancesAtom)

  if (!hasFirstLoad) return false
  if (!get(balancesWatcherHealthAtom).isRecovering) return true
  if (!chainId) return false

  // `BalancesResetUpdater` clears the updates on account change, so they are of the current account only
  return Object.values(get(balancesUpdateAtom)[chainId] ?? {}).some(Boolean)
})
