import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { mapSupportedNetworks } from '@cowprotocol/cow-sdk'

import { balancesAtom, balancesCacheAtom, balancesUpdateAtom, DEFAULT_BALANCES_STATE } from '../state/balancesAtom'

interface BalancesResetUpdaterProps {
  account: string | undefined
  chainId: number
}

export function BalancesResetUpdater({ account, chainId }: BalancesResetUpdaterProps): null {
  const prevChainId = usePrevious(chainId)
  const prevAccount = usePrevious(account)
  const setBalancesCache = useSetAtom(balancesCacheAtom)

  const setBalances = useSetAtom(balancesAtom)
  const setBalancesUpdate = useSetAtom(balancesUpdateAtom)

  // Reset states when wallet is not connected
  useEffect(() => {
    if (prevAccount && prevAccount !== account) {
      setBalances(DEFAULT_BALANCES_STATE)
      setBalancesCache(mapSupportedNetworks({}))
      setBalancesUpdate(mapSupportedNetworks({}))
    }
  }, [chainId, account, prevAccount, setBalances, setBalancesCache, setBalancesUpdate])

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
  }, [chainId, prevChainId, setBalances])

  return null
}
