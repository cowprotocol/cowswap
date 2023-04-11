import { TokenBalance } from '../state/tokenBalances'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useCallback, useMemo } from 'react'
import { TokenBalanceSubscriptionResult, useGetTokenBalances } from './useGetTokenBalances'
import { TokenBalanceSubscription } from '../state/tokenSubscriptionQueues'

/**
 * Return the balances of the tokens.
 *
 * The virtual word refers to the fact that the balances don't necesarilly reflect the onchain value, its possible
 * that they are modified by some local state (like an uncommited transaction bundle)
 */
export function useGetVirtualBalances(subscription: TokenBalanceSubscription): TokenBalanceSubscriptionResult {
  const { getTokenBalance, clearSubscription } = useGetTokenBalances(subscription)

  const getVirtualBalances = useCallback(
    (chainId: SupportedChainId, tokenAddress: string): TokenBalance | null => {
      // TODO: Apply all the balance transformations (i.e. bundled tx)
      return getTokenBalance(chainId, tokenAddress)
    },
    [getTokenBalance]
  )

  return useMemo(
    () => ({
      getTokenBalance: getVirtualBalances,
      clearSubscription,
    }),
    [getVirtualBalances, clearSubscription]
  )
}
