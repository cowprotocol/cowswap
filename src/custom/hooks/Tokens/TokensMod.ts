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
import { tokensByAddressAtom } from '@cow/modules/tokensList/tokensListAtom'
import { Token } from '@uniswap/sdk-core'
import { useAllLists, useInactiveListUrls } from 'state/lists/hooks'
import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'
import { getTokenFilter } from 'lib/hooks/useTokenList/filtering'
import { deserializeToken } from 'state/user/hooks'

export * from '@src/hooks/Tokens'

export function useAllTokens(): { [address: string]: Token } {
  return useAtomValue(tokensByAddressAtom)
}

export function useSearchInactiveTokenLists(search: string | undefined, minResults = 10): Token[] {
  const lists = useAllLists()
  const inactiveUrls = useInactiveListUrls()
  const { chainId } = useWeb3React()
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
        if (tokenInfo.chainId === chainId && tokenFilter(tokenInfo)) {
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
  }, [activeTokens, chainId, inactiveUrls, lists, minResults, search])
}
