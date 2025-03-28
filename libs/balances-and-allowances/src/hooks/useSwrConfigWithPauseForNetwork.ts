import { useAtomValue } from 'jotai'
import { useMemo, useRef } from 'react'

import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'
import { SWRConfiguration } from 'swr'

import { balancesAtom, balancesUpdateAtom } from '../state/balancesAtom'

const BALANCE_VALIDITY_PERIOD = ms`20s`

/**
 * To avoid fetching balances too frequently, this hook allows to pause SWR fetching based on the last update timestamp.
 */
export function useSwrConfigWithPauseForNetwork(
  chainId: SupportedChainId,
  config: SWRConfiguration,
  validityPeriod = BALANCE_VALIDITY_PERIOD,
): SWRConfiguration {
  const balances = useAtomValue(balancesAtom)
  const balancesUpdate = useAtomValue(balancesUpdateAtom)

  const balancesChainId = balances.chainId
  const lastUpdateTimestamp = balancesUpdate[chainId]

  const lastUpdateTimestampRef = useRef(lastUpdateTimestamp)

  if (!(balancesChainId && balancesChainId !== chainId)) {
    lastUpdateTimestampRef.current = lastUpdateTimestamp
  }

  return useMemo(
    () => ({
      ...config,
      isPaused: () => {
        const lastUpdateTimestamp = lastUpdateTimestampRef.current

        return !!lastUpdateTimestamp && Date.now() - lastUpdateTimestamp < validityPeriod
      },
    }),
    [config, validityPeriod],
  )
}
