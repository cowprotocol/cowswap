import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, Token } from '@uniswap/sdk-core'

import { getChainInfo } from 'legacy/constants/chainInfo'
import { useAllLists, useInactiveListUrls } from 'legacy/state/lists/hooks'
import { deserializeToken, useUserAddedTokens } from 'legacy/state/user/hooks'

import { TokensByAddress, tokensByAddressAtom } from 'modules/tokensList/state/tokensListAtom'
import { useWalletInfo } from 'modules/wallet'

import { useCurrencyFromMap, useTokenFromMapOrNetwork } from 'lib/hooks/useCurrency'
import { getTokenFilter } from 'lib/hooks/useTokenList/filtering'
import { doesTokenMatchSymbolOrAddress } from 'utils/doesTokenMatchSymbolOrAddress'

import { TokenAddressMap, useUnsupportedTokenList } from './../state/lists/hooks'

// reduce token map into standard address <-> Token mapping, optionally include user added tokens
export function useTokensFromMap(tokenMap: TokenAddressMap, includeUserAdded: boolean): { [address: string]: Token } {
  const { chainId } = useWalletInfo()
  const userAddedTokens = useUserAddedTokens()

  return useMemo(() => {
    if (!chainId) return {}

    // reduce to just tokens
    const mapWithoutUrls = Object.keys(tokenMap[chainId] ?? {}).reduce<{ [address: string]: Token }>(
      (newMap, address) => {
        newMap[address] = tokenMap[chainId][address].token
        return newMap
      },
      {}
    )

    if (includeUserAdded) {
      return (
        userAddedTokens
          // reduce into all ALL_TOKENS filtered by the current chain
          .reduce<{ [address: string]: Token }>(
            (tokenMap, token) => {
              tokenMap[token.address] = token
              return tokenMap
            },
            // must make a copy because reduce modifies the map, and we do not
            // want to make a copy in every iteration
            { ...mapWithoutUrls }
          )
      )
    }

    return mapWithoutUrls
  }, [chainId, userAddedTokens, tokenMap, includeUserAdded])
}

export function useAllTokens(): TokensByAddress {
  return useAtomValue(tokensByAddressAtom)
}

type BridgeInfo = Record<
  SupportedChainId,
  {
    tokenAddress: string
    originBridgeAddress: string
    destBridgeAddress: string
  }
>

export function useUnsupportedTokens(): { [address: string]: Token } {
  const { chainId } = useWalletInfo()
  const listsByUrl = useAllLists()
  const unsupportedTokensMap = useUnsupportedTokenList()
  const unsupportedTokens = useTokensFromMap(unsupportedTokensMap, false)

  // checks the default L2 lists to see if `bridgeInfo` has an L1 address value that is unsupported
  const l2InferredBlockedTokens: typeof unsupportedTokens = useMemo(() => {
    if (!chainId) {
      return {}
    }

    if (!listsByUrl) {
      return {}
    }

    const listUrl = getChainInfo(chainId)?.defaultListUrl

    if (!listUrl) {
      return {}
    }

    const { current: list } = listsByUrl[listUrl]
    if (!list) {
      return {}
    }

    const unsupportedSet = new Set(Object.keys(unsupportedTokens))

    return list.tokens.reduce((acc, tokenInfo) => {
      const bridgeInfo = tokenInfo.extensions?.bridgeInfo as unknown as BridgeInfo
      if (
        bridgeInfo &&
        bridgeInfo[SupportedChainId.MAINNET] &&
        bridgeInfo[SupportedChainId.MAINNET].tokenAddress &&
        unsupportedSet.has(bridgeInfo[SupportedChainId.MAINNET].tokenAddress)
      ) {
        const address = bridgeInfo[SupportedChainId.MAINNET].tokenAddress
        // don't rely on decimals--it's possible that a token could be bridged w/ different decimals on the L2
        return { ...acc, [address]: new Token(SupportedChainId.MAINNET, address, tokenInfo.decimals) }
      }
      return acc
    }, {})
  }, [chainId, listsByUrl, unsupportedTokens])

  return { ...unsupportedTokens, ...l2InferredBlockedTokens }
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
