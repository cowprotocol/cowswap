import { useCallback, useRef } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isTruthy } from '@cowprotocol/common-utils'
import { fetchTokenFromBlockchain, TokensByAddress, useAddUserToken, useTokensByAddressMap } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { Token } from '@uniswap/sdk-core'

import { getTokenFromMapping } from 'utils/orderUtils/getTokenFromMapping'

export function useTokensForOrdersList(): (tokensToFetch: string[]) => Promise<TokensByAddress> {
  const { chainId } = useWalletInfo()
  // TODO M-6 COW-573
  const provider = useWalletProvider()
  const allTokens = useTokensByAddressMap()
  const addUserTokens = useAddUserToken()

  const getToken = useCallback(
    async (address: string) => {
      if (!provider) return null
      return fetchTokenFromBlockchain(address, chainId, provider).then(TokenWithLogo.fromToken)
    },
    [chainId, provider],
  )

  // Using a ref to store allTokens to avoid re-fetching when new tokens are added
  // but still use the latest whenever the callback is invoked
  const allTokensRef = useRef(allTokens)
  // Updated on every change
  // eslint-disable-next-line react-hooks/refs
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

      // Add fetched tokens to the user-added tokens store to avoid re-fetching them
      const tokensToAdd = Object.values(fetchedTokens).filter(isTruthy)

      if (tokensToAdd.length > 0) {
        // FIXME: this might be a cause of the problem when we get listed tokens as user-added tokens
        // Since we use allTokensRef which is not a part of the hooks deps, there might be a race condition
        console.log('Add missing tokens from orders as user-added: ', tokensToAdd)
        addUserTokens(tokensToAdd)
      }

      // Merge fetched tokens with what's currently loaded
      return { ...tokens, ...fetchedTokens }
    },
    [chainId, getToken, addUserTokens],
  )
}

async function _fetchTokens(
  tokensToFetch: string[],
  getToken: (address: string) => Promise<Token | null>,
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
