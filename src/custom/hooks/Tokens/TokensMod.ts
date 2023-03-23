/* import { useWeb3React } from '@web3-react/core'
import { getChainInfo } from '@src/constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { useCurrencyFromMap, useTokenFromMapOrNetwork } from 'lib/hooks/useCurrency'
import { getTokenFilter } from 'lib/hooks/useTokenList/filtering'
import { useMemo } from 'react'
import { isL2ChainId } from 'utils/chains'

import { useAllLists, useCombinedActiveList, useInactiveListUrls } from 'state/lists/hooks'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import { useUserAddedTokens } from 'state/user/hooks' */

// MOD imports
import { useAtomValue } from 'jotai/utils'
import { tokensByAddressAtom } from '@cow/modules/tokensList/state/tokensListAtom'
import { Token } from '@uniswap/sdk-core'
import { useAllLists, useInactiveListUrls } from 'state/lists/hooks'
import { useMemo } from 'react'
import { getTokenFilter } from 'lib/hooks/useTokenList/filtering'
import { deserializeToken } from 'state/user/hooks'
import { checkBySymbolAndAddress } from '@cow/utils/checkBySymbolAndAddress'
import { useWalletInfo } from '@cow/modules/wallet'

export * from '@src/hooks/Tokens'

export function useAllTokens(): { [address: string]: Token } {
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
        const isTokenMatched = strictSearch ? checkBySymbolAndAddress(tokenInfo, search) : tokenFilter(tokenInfo)

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
