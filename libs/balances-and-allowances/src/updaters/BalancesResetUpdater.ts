import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { mapChainEnum, SupportedChainId } from '@cowprotocol/cow-sdk'

import { allowancesAtom } from '../state/allowancesAtom'
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
  const setAllowances = useSetAtom(allowancesAtom)

  // Reset states when wallet is not connected
  useEffect(() => {
    if (prevAccount && prevAccount !== account) {
      setBalances(DEFAULT_BALANCES_STATE)
      setBalancesCache(mapChainEnum(SupportedChainId, {}))
      setBalancesUpdate(mapChainEnum(SupportedChainId, {}))
      // Allowances (e.g. Solana SPL delegations) are keyed by chain+token but not by account, so a
      // same-chain wallet switch would otherwise surface the previous account's approvals until the new
      // fetch lands. Clear them alongside balances.
      setAllowances(mapChainEnum(SupportedChainId, {}))
    }
  }, [chainId, account, prevAccount, setBalances, setBalancesCache, setBalancesUpdate, setAllowances])

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
