import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useRef } from 'react'

import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'
import { SWRConfiguration } from 'swr'

import { balancesAtom, balancesUpdateAtom } from '../state/balancesAtom'

const BALANCE_VALIDITY_PERIOD = ms`20s`

/**
 * To avoid fetching balances too frequently, this hook allows to pause SWR fetching based on the last update timestamp.
 */
export function useSwrConfigWithPause(
  chainId: SupportedChainId,
  config: SWRConfiguration,
  validityPeriod = BALANCE_VALIDITY_PERIOD,
): SWRConfiguration {
  const shouldSkipFetchingRef = useRef<Record<number, boolean>>({})
  const balances = useAtomValue(balancesAtom)
  const balancesUpdate = useAtomValue(balancesUpdateAtom)

  const balancesChainId = balances.chainId
  const lastUpdateTimestamp = balancesUpdate[chainId]

  useEffect(() => {
    if (balancesChainId && balancesChainId !== chainId) {
      return
    }

    shouldSkipFetchingRef.current[chainId] = !!lastUpdateTimestamp && Date.now() - lastUpdateTimestamp < validityPeriod
  }, [balancesChainId, lastUpdateTimestamp, chainId, validityPeriod])

  return useMemo(
    () => ({
      ...config,
      isPaused: () => shouldSkipFetchingRef.current[chainId],
    }),
    [config, chainId],
  )
}
