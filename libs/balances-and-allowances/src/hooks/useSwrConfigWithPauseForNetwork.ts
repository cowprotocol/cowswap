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
export function useSwrConfigWithPauseForNetwork(
  chainId: SupportedChainId,
  account: string | undefined,
  config: SWRConfiguration,
  validityPeriod?: number,
): SWRConfiguration {
  const effectiveValidityPeriod = validityPeriod || BALANCE_VALIDITY_PERIOD
  const balances = useAtomValue(balancesAtom)
  const balancesUpdate = useAtomValue(balancesUpdateAtom)

  const balancesChainId = balances.chainId
  const lastUpdateTimestamp = account ? balancesUpdate[chainId]?.[account.toLowerCase()] : undefined

  const lastUpdateTimestampRef = useRef(lastUpdateTimestamp)

  // update lastUpdateTimestampRef only when balances state chainId in sync with current chainId
  useEffect(() => {
    if (!balancesChainId || balancesChainId === chainId) {
      lastUpdateTimestampRef.current = lastUpdateTimestamp
    }
  }, [balancesChainId, chainId, lastUpdateTimestamp])

  return useMemo(
    () => ({
      ...config,
      isPaused: () => {
        if (config.isPaused?.()) return true

        const timestamp = lastUpdateTimestampRef.current

        return !!timestamp && Date.now() - timestamp < effectiveValidityPeriod
      },
    }),
    [config, effectiveValidityPeriod],
  )
}
