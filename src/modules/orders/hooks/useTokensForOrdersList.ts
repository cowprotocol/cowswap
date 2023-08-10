import { useCallback, useRef } from 'react'

import { EnrichedOrder, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'

import { useAllTokens } from 'legacy/hooks/Tokens'
import { useTokenLazy } from 'legacy/hooks/useTokenLazy'

import { TokensByAddress, TokenWithLogo } from 'modules/tokensList/state/tokensListAtom'
import { useWalletInfo } from 'modules/wallet'

import { getTokenFromMapping } from 'utils/orderUtils/getTokenFromMapping'

export function useTokensForOrdersList(): (orders: EnrichedOrder[]) => Promise<TokensByAddress> {
  const { chainId } = useWalletInfo()
  const allTokens = useAllTokens()
  const getToken = useTokenLazy()

  // Using a ref to store allTokens to avoid re-fetching when new tokens are added
  // but still use the latest whenever the callback is invoked
  const allTokensRef = useRef(allTokens)
  // Updated on every change
  allTokensRef.current = allTokens

  return useCallback(
    async (orders: EnrichedOrder[]) => {
      const tokens = allTokensRef.current
      const tokensToFetch = _getMissingTokensAddresses(orders, tokens, chainId)
      const fetchedTokens = await _fetchTokens(tokensToFetch, getToken)

      // Merge fetched tokens with what's currently loaded
      return { ...tokens, ...fetchedTokens }
    },
    [chainId, getToken]
  )
}

function _getMissingTokensAddresses(
  orders: EnrichedOrder[],
  tokens: Record<string, Token>,
  chainId: SupportedChainId
): string[] {
  const tokensToFetch = new Set<string>()

  // Find out which tokens are not yet loaded in the UI
  orders.forEach(({ sellToken, buyToken }) => {
    if (!getTokenFromMapping(sellToken, chainId, tokens)) tokensToFetch.add(sellToken)
    if (!getTokenFromMapping(buyToken, chainId, tokens)) tokensToFetch.add(buyToken)
  })

  return Array.from(tokensToFetch)
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

      acc[promiseResult.value.address] = new TokenWithLogo(undefined, chainId, address, decimals, symbol, name)
    }
    return acc
  }, {})
}
