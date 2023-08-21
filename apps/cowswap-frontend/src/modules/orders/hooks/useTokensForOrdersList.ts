import { useCallback, useRef } from 'react'

import { Token } from '@uniswap/sdk-core'

import { useAllTokens } from 'legacy/hooks/Tokens'
import { useTokenLazy } from 'legacy/hooks/useTokenLazy'

import { TokensByAddress, TokenWithLogo } from 'modules/tokensList/state/tokensListAtom'
import { useWalletInfo } from 'modules/wallet'

import { getTokenFromMapping } from 'utils/orderUtils/getTokenFromMapping'

export function useTokensForOrdersList(): (tokensToFetch: string[]) => Promise<TokensByAddress> {
  const { chainId } = useWalletInfo()
  const allTokens = useAllTokens()
  const getToken = useTokenLazy()

  // Using a ref to store allTokens to avoid re-fetching when new tokens are added
  // but still use the latest whenever the callback is invoked
  const allTokensRef = useRef(allTokens)
  // Updated on every change
  allTokensRef.current = allTokens

  return useCallback(
    async (_tokensToFetch: string[]) => {
      const tokens = allTokensRef.current

      const tokensToFetch = _tokensToFetch.reduce<string[]>((acc, token) => {
        const tokenLowercase = token.toLowerCase()

        if (!getTokenFromMapping(tokenLowercase, chainId, tokens)) {
          acc.push(tokenLowercase)
        }
        return acc
      }, [])

      const fetchedTokens = await _fetchTokens(tokensToFetch, getToken)

      // Merge fetched tokens with what's currently loaded
      return { ...tokens, ...fetchedTokens }
    },
    [chainId, getToken]
  )
}

async function _fetchTokens(
  tokensToFetch: string[],
  getToken: (address: string) => Promise<Token | null>
): Promise<TokensByAddress> {
  if (tokensToFetch.length === 0) {
    return {}
  }

  const promises = tokensToFetch.map((address) => getToken(address))
  const settledPromises = await Promise.allSettled(promises)

  return settledPromises.reduce<TokensByAddress>((acc, promiseResult) => {
    if (promiseResult.status === 'fulfilled' && promiseResult.value) {
      const { chainId, address, decimals, symbol, name } = promiseResult.value
      const addressLowercase = address.toLowerCase()

      acc[addressLowercase] = new TokenWithLogo(undefined, chainId, addressLowercase, decimals, symbol, name)
    }
    return acc
  }, {})
}
