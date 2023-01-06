import { useUpdateAtom } from 'jotai/utils'
import { tokensByAddressAtom, tokensBySymbolAtom } from '@cow/modules/tokensList/tokensListAtom'
import { useEffect } from 'react'
import { useTokensListWithDefaults } from 'state/lists/hooks/hooksMod'
import { Token } from '@uniswap/sdk-core'
import { deserializeToken } from 'state/user/hooks'

export function TokensListUpdater() {
  const allTokens = useTokensListWithDefaults()
  const updateTokensByAddress = useUpdateAtom(tokensByAddressAtom)
  const updateTokensBySymbol = useUpdateAtom(tokensBySymbolAtom)

  useEffect(() => {
    const tokensByAddressMap: { [address: string]: Token } = {}
    const tokensBySymbolMap: { [address: string]: Token[] } = {}

    allTokens.forEach((token) => {
      const wrappedToken = deserializeToken(token)

      tokensByAddressMap[token.address.toLowerCase()] = wrappedToken
      tokensBySymbolMap[token.symbol] = tokensBySymbolMap[token.symbol] || []

      const existedTokenBySymbol = tokensBySymbolMap[token.symbol].find(
        (token) => token.address.toLowerCase() === wrappedToken.address.toLowerCase()
      )
      if (!existedTokenBySymbol) {
        tokensBySymbolMap[token.symbol].push(wrappedToken)
      }
    })

    updateTokensByAddress(tokensByAddressMap)
    updateTokensBySymbol(tokensBySymbolMap)
  }, [allTokens, updateTokensByAddress, updateTokensBySymbol])

  return null
}
