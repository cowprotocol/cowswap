import { useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { mapSupportedNetworks } from '@cowprotocol/cow-sdk'

import { allowancesFullState } from '../state/allowancesAtom'
import { balancesAtom, balancesCacheAtom, DEFAULT_BALANCES_STATE } from '../state/balancesAtom'

interface BalancesResetUpdaterProps {
  account: string | undefined
  chainId: number
}

export function BalancesResetUpdater({ account, chainId }: BalancesResetUpdaterProps): null {
  const prevChainId = usePrevious(chainId)
  const prevAccount = usePrevious(account)
  const setBalancesCache = useSetAtom(balancesCacheAtom)

  const setBalances = useSetAtom(balancesAtom)
  const resetAllowances = useResetAtom(allowancesFullState)

  // Reset states when wallet is not connected
  useEffect(() => {
    if (prevAccount && prevAccount !== account) {
      setBalances(DEFAULT_BALANCES_STATE)
      resetAllowances()
      setBalancesCache(mapSupportedNetworks({}))
    }
  }, [chainId, account, prevAccount, resetAllowances, setBalances, setBalancesCache])

  /**
   * Reset balances and allowances when chainId is changed.
   *
   * If we don't reset the values, you might see balances from the previous network after switching,
   * because it takes awhile to load balances for the new chain.
   * p.s. there is BalancesCacheUpdater which fills cached values in.
   */
  useEffect(() => {
    if (prevChainId && chainId === prevChainId) return

    setBalances((state) => {
      // Reset balances only when current state is not from cache
      // Because cache set values only to the current network
      if (!state.fromCache) {
        return DEFAULT_BALANCES_STATE
      }

      return state
    })
    resetAllowances()
  }, [chainId, prevChainId, setBalances, resetAllowances])

  return null
}
