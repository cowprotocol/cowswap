import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useTokenBalancesWithLoadingIndicator } from 'lib/hooks/useCurrencyBalance'
import { useMemo } from 'react'

import { useAllTokens } from '../../hooks/Tokens'
import { useFavouriteTokens } from 'state/user/hooks'
import { useWalletInfo } from '@cow/modules/wallet'

export * from '@src/state/connection/hooks'

// mimics useAllBalances
export function useAllTokenBalances(): [{ [tokenAddress: string]: CurrencyAmount<Token> | undefined }, boolean] {
  const { account } = useWalletInfo()
  const allTokens = useAllTokens()
  // Mod, add favourite tokens to balances
  const favTokens = useFavouriteTokens()

  const allTokensArray = useMemo(() => {
    const favTokensObj = favTokens.reduce(
      (acc, cur: Token) => {
        acc[cur.address] = cur
        return acc
      },
      {} as {
        [address: string]: Token
      }
    )

    return Object.values({ ...favTokensObj, ...allTokens })
  }, [allTokens, favTokens])

  const [balances, balancesIsLoading] = useTokenBalancesWithLoadingIndicator(account ?? undefined, allTokensArray)
  return [balances ?? {}, balancesIsLoading]
}
