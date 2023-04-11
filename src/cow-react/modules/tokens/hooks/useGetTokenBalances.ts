import { useAtomValue, useSetAtom } from 'jotai'
import { TokenBalance, getBalanceKey, tokenBalancesAtom } from '../state/tokenBalances'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useCallback } from 'react'

import { useMemo } from 'react'
import { TokenBalanceSubscription, subscribeTokensAtom, unsubscribeTokensAtom } from '../state/tokenSubscriptionQueues'

export interface TokenBalanceSubscriptionResult {
  getTokenBalance: (chainId: SupportedChainId, tokenAddress: string) => TokenBalance | null
  clearSubscription: () => void
}

/**
 * Subscribe to the balance/allwance of some tokens. It will return a function to get the current balance
 */
export function useGetTokenBalances(subscription: TokenBalanceSubscription): TokenBalanceSubscriptionResult {
  const balances = useAtomValue(tokenBalancesAtom)
  const subscribeTokens = useSetAtom(subscribeTokensAtom)
  const unsuscribeTokens = useSetAtom(unsubscribeTokensAtom)

  // Create the subscription
  const { account, tokens, queuePrio } = subscription
  console.log(`[useGetTokenBalance] subscribe ${account} for ${tokens?.length || 0} tokens with prio ${queuePrio}`)
  subscribeTokens(subscription)

  // Get tokens function
  const getTokenBalance = useCallback(
    (chainId: SupportedChainId, tokenAddress: string): TokenBalance | null => {
      return balances[getBalanceKey(chainId, tokenAddress)]
    },
    [balances]
  )

  // Clear subscription function
  const clearSubscription = useCallback(() => {
    const { account, tokens, queuePrio } = subscription
    console.log(`[useGetTokenBalance] subscribe ${account} for ${tokens?.length || 0} tokens with prio ${queuePrio}`)
    unsuscribeTokens(subscription)
  }, [unsuscribeTokens, subscription])

  // Return memoized result
  return useMemo(
    () => ({
      getTokenBalance,
      clearSubscription,
    }),
    [getTokenBalance, clearSubscription]
  )
}
