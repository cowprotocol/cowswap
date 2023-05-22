import { Token } from '@uniswap/sdk-core'
import { useOnchainBalances } from 'modules/tokens'
import { useMemo } from 'react'

import { useAllTokens } from 'legacy/hooks/Tokens'
import { useFavouriteTokens } from 'legacy/state/user/hooks'
import { useWalletInfo } from 'modules/wallet'
import { TokenAmounts } from 'modules/tokens'

// mimics useAllBalances
export function useAllTokenBalances(): [TokenAmounts, boolean] {
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

  const { isLoading, amounts } = useOnchainBalances({
    account: account ?? undefined,
    tokens: allTokensArray,
  })
  return [amounts ?? {}, isLoading]
}
