import { atom, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'

import { usePersistBalancesAndAllowances } from '@cowprotocol/balances-and-allowances'
import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { LP_TOKEN_LIST_CATEGORIES, useAllLpTokens } from '@cowprotocol/tokens'

import ms from 'ms.macro'

// A small gap between balances and allowances refresh intervals is needed to avoid high load to the node at the same time
const LP_BALANCES_SWR_CONFIG = { refreshInterval: ms`32s` }
const LP_ALLOWANCES_SWR_CONFIG = { refreshInterval: ms`34s` }
const LP_MULTICALL_OPTIONS = { consequentExecution: true }

// To avoid high load to the node at the same time
// We start the updater with a delay
const LP_UPDATER_START_DELAY = ms`3s`

export const areLpBalancesLoadedAtom = atom(false)

export interface BalancesAndAllowancesUpdaterProps {
  account: string | undefined
  chainId: SupportedChainId
  enablePolling: boolean
}
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function LpBalancesAndAllowancesUpdater({ account, chainId, enablePolling }: BalancesAndAllowancesUpdaterProps) {
  const allLpTokens = useAllLpTokens(LP_TOKEN_LIST_CATEGORIES)
  const [isUpdaterPaused, setIsUpdaterPaused] = useState(true)
  const setAreLpBalancesLoaded = useSetAtom(areLpBalancesLoadedAtom)

  const lpTokenAddresses = useMemo(() => allLpTokens.map((token) => token.address), [allLpTokens])

  usePersistBalancesAndAllowances({
    account: isUpdaterPaused ? undefined : account,
    chainId,
    tokenAddresses: lpTokenAddresses,
    setLoadingState: false,
    balancesSwrConfig: enablePolling ? LP_BALANCES_SWR_CONFIG : SWR_NO_REFRESH_OPTIONS,
    allowancesSwrConfig: enablePolling ? LP_ALLOWANCES_SWR_CONFIG : SWR_NO_REFRESH_OPTIONS,
    multicallOptions: LP_MULTICALL_OPTIONS,
    onBalancesLoaded: setAreLpBalancesLoaded,
  })

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsUpdaterPaused(false)
    }, LP_UPDATER_START_DELAY)

    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    setAreLpBalancesLoaded(false)
  }, [account, setAreLpBalancesLoaded])

  return null
}
