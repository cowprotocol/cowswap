import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useEffect, useRef } from 'react'

import { useCustomTokensForAllEvmChains } from '../hooks/useCustomTokensForAllEvmChains'
import { useEnabledTokensListsUrls } from '../hooks/useEnabledTokensListsUrls'
import { useMultiChainBalancesSession } from '../hooks/useMultiChainBalancesSession'
import { multiChainBalancesAtom } from '../state/multiChainBalancesAtom'
import { multiChainModeEnabledAtom } from '../state/multiChainModeAtom'

export interface MultiChainBalancesUpdaterProps {
  account: string | undefined
}

/**
 * Additive, all-chains peer of `BalancesWatcherUpdater`: drives the
 * balances-aggregator session that feeds `multiChainBalancesAtom` for the
 * cross-chain balances shown in the token selector. Never touches
 * `balancesAtom` or the single active-chain fetching path.
 */
export function MultiChainBalancesUpdater({ account }: MultiChainBalancesUpdaterProps): ReactNode {
  const enabled = useAtomValue(multiChainModeEnabledAtom)
  const tokensListsUrls = useEnabledTokensListsUrls()
  const customTokensByChain = useCustomTokensForAllEvmChains()
  const setMultiChainBalances = useSetAtom(multiChainBalancesAtom)

  const previousAccount = useRef(account)
  useEffect(() => {
    if (previousAccount.current !== account) {
      previousAccount.current = account
      setMultiChainBalances({})
    }
  }, [account, setMultiChainBalances])

  useMultiChainBalancesSession({
    account,
    tokensListsUrls,
    customTokensByChain,
    enabled,
  })

  return null
}
