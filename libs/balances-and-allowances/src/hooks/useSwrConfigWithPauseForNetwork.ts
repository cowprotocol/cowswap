import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useRef, useState } from 'react'

import { getAddressKey, type SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import { BalancesQueryConfig } from './usePersistBalancesViaWebCalls'

import { balancesAtom, balancesUpdateAtom } from '../state/balancesAtom'

const BALANCE_VALIDITY_PERIOD = ms`20s`

/**
 * To avoid fetching balances too frequently, this hook allows to pause fetching based on the last update timestamp.
 */
export function useSwrConfigWithPauseForNetwork(
  chainId: SupportedChainId,
  account: string | undefined,
  config: BalancesQueryConfig,
  validityPeriod?: number,
  refreshTrigger?: number,
): BalancesQueryConfig {
  const effectiveValidityPeriod = validityPeriod || BALANCE_VALIDITY_PERIOD
  const balances = useAtomValue(balancesAtom)
  const balancesUpdate = useAtomValue(balancesUpdateAtom)

  const balancesChainId = balances.chainId
  const lastUpdateTimestamp = account ? balancesUpdate[chainId]?.[getAddressKey(account)] : undefined

  const lastUpdateTimestampRef = useRef(lastUpdateTimestamp)

  // update lastUpdateTimestampRef only when balances state chainId in sync with current chainId
  useEffect(() => {
    if (!balancesChainId || balancesChainId === chainId) {
      lastUpdateTimestampRef.current = lastUpdateTimestamp
    }
  }, [balancesChainId, chainId, lastUpdateTimestamp])

  // The trigger value carried by the most recent fetch to land. Initialised to the mounting value so a
  // mount with fresh balances still pauses — that is what the throttle is for. Held as state, not a
  // ref: consumers call `isPaused()` while computing `enabled`, before effects run, so this has to be
  // readable during render and has to schedule one when it settles.
  const [settledRefreshTrigger, setSettledRefreshTrigger] = useState(refreshTrigger)
  const previousUpdateTimestampRef = useRef(lastUpdateTimestamp)

  // Settles only when a fetch lands, never merely because the trigger moved — otherwise the request
  // would mark itself satisfied without anything having been re-read.
  useEffect(() => {
    if (previousUpdateTimestampRef.current === lastUpdateTimestamp) return

    previousUpdateTimestampRef.current = lastUpdateTimestamp
    setSettledRefreshTrigger(refreshTrigger)
  }, [lastUpdateTimestamp, refreshTrigger])

  const isForcedRefreshPending = refreshTrigger !== settledRefreshTrigger

  return useMemo(
    () => ({
      ...config,
      isPaused: () => {
        const timestamp = lastUpdateTimestampRef.current

        if (!timestamp) return false

        // A deliberate invalidation (an order filled, a transaction confirmed) must outrank the
        // throttle, or the refetch it asks for is dropped and the caller waits out the very period it
        // was trying to skip.
        if (isForcedRefreshPending) return false

        return Date.now() - timestamp < effectiveValidityPeriod
      },
    }),
    [config, effectiveValidityPeriod, isForcedRefreshPending],
  )
}
