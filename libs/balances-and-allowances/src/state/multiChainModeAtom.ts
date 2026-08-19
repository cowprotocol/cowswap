import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { MultiChainBalancesHealth, multiChainBalancesHealthAtom } from './multiChainBalancesHealthAtom'

/**
 * User preference for showing cross-chain balances in the token selector.
 * On by default; the effective state (see `multiChainModeActiveAtom`) also
 * depends on the aggregator session's health.
 */
export const multiChainModeEnabledAtom = atomWithStorage<boolean>('multiChainModeEnabled:v1', true)

/**
 * Whether cross-chain balances should actually be fetched/displayed right
 * now: the user preference is on AND the aggregator session isn't in
 * `Fallback`. Read by both the session hook (to gate fetching) and the token
 * list UI (to gate rendering).
 */
export const multiChainModeActiveAtom = atom((get) => {
  const enabled = get(multiChainModeEnabledAtom)
  const health = get(multiChainBalancesHealthAtom)

  return enabled && health.status !== MultiChainBalancesHealth.Fallback
})
