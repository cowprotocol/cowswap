import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { doesTokenMatchSymbolOrAddress } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, Token } from '@uniswap/sdk-core'

import { useAllLists, useInactiveListUrls } from 'legacy/state/lists/hooks'
import { deserializeToken, useFavouriteTokens, useUserAddedTokens } from 'legacy/state/user/hooks'

import { TokensByAddress, tokensByAddressAtom } from 'modules/tokensList/state/tokensListAtom'

import { getTokenFilter } from 'lib/hooks/useTokenList/filtering'

import { useCurrencyFromMap, useTokenFromMapOrNetwork } from '../../lib/hooks/useCurrency'
import { TokenAmounts, useOnchainBalances } from '../../modules/tokens'

export function useAllTokens(): TokensByAddress {
  return useAtomValue(tokensByAddressAtom)
}

export function useSearchInactiveTokenLists(
  search: string | undefined,
  minResults = 10,
  strictSearch = false
): Token[] {
  const lists = useAllLists()
  const inactiveUrls = useInactiveListUrls()
  const { chainId } = useWalletInfo()
  const activeTokens = useAllTokens()

  return useMemo(() => {
    if (!search || search.trim().length === 0) return []
    const tokenFilter = getTokenFilter(search)
    const result: Token[] = []
    const addressSet: { [address: string]: true } = {}

    for (const url of inactiveUrls) {
      const list = lists[url].current
      if (!list) continue

      for (const tokenInfo of list.tokens) {
        const isTokenMatched = strictSearch ? doesTokenMatchSymbolOrAddress(tokenInfo, search) : tokenFilter(tokenInfo)

        if (tokenInfo.chainId === chainId && isTokenMatched) {
          try {
            const tokenAddress = tokenInfo.address.toLowerCase()

            if (!(tokenInfo.address in activeTokens) && !addressSet[tokenAddress]) {
              addressSet[tokenAddress] = true
              result.push(deserializeToken(tokenInfo))
              if (result.length >= minResults) return result
            }
          } catch {
            continue
          }
        }
      }
    }
    return result
  }, [activeTokens, chainId, inactiveUrls, lists, minResults, search, strictSearch])
}

export function useIsTokenActive(token: Token | undefined | null): boolean {
  const activeTokens = useAllTokens()

  if (!activeTokens || !token) {
    return false
  }

  return !!activeTokens[token.address]
}

// Check if currency is included in custom list from user storage
export function useIsUserAddedToken(currency: Currency | undefined | null): boolean {
  const userAddedTokens = useUserAddedTokens()

  if (!currency) {
    return false
  }

  return !!userAddedTokens.find((token) => currency.equals(token))
}

// undefined if invalid or does not exist
// null if loading or null was passed
// otherwise returns the token
export function useToken(tokenAddress?: string | null): Token | null | undefined {
  const tokens = useAllTokens()
  return useTokenFromMapOrNetwork(tokens, tokenAddress)
}

export function useCurrency(currencyId?: string | null): Currency | null | undefined {
  const tokens = useAllTokens()
  return useCurrencyFromMap(tokens, currencyId)
}

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
