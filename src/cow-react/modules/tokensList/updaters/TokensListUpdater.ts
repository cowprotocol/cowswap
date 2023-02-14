import { useUpdateAtom } from 'jotai/utils'
import { tokensByAddressAtom, tokensBySymbolAtom, TokenWithLogo } from '@cow/modules/tokensList/state/tokensListAtom'
import { useEffect } from 'react'
import { useTokensListWithDefaults } from 'state/lists/hooks/hooksMod'
import { fixTokenInfo } from './utils'

/**
 * This updater protects from redundant recalculations
 * Using it we call useTokensListWithDefaults() and map it's result only once
 */
export function TokensListUpdater() {
  const allTokens = useTokensListWithDefaults()
  const updateTokensByAddress = useUpdateAtom(tokensByAddressAtom)
  const updateTokensBySymbol = useUpdateAtom(tokensBySymbolAtom)

  useEffect(() => {
    const tokensByAddressMap: { [address: string]: TokenWithLogo } = {}
    const tokensBySymbolMap: { [address: string]: TokenWithLogo[] } = {}

    allTokens.forEach((token) => {
      const addressLowerCase = token.address.toLowerCase()
      const symbolLowerCase = token.symbol.toLowerCase()
      const fixedToken = fixTokenInfo(token)

      if (!tokensByAddressMap[addressLowerCase]) {
        tokensByAddressMap[addressLowerCase] = fixedToken
      }

      tokensBySymbolMap[symbolLowerCase] = tokensBySymbolMap[symbolLowerCase] || []

      const isTokenInTheSymbolMap = !!tokensBySymbolMap[symbolLowerCase].find(
        (token) => token.address.toLowerCase() === addressLowerCase
      )
      if (!isTokenInTheSymbolMap) {
        tokensBySymbolMap[symbolLowerCase].push(fixedToken)
      }
    })

    updateTokensByAddress(tokensByAddressMap)
    updateTokensBySymbol(tokensBySymbolMap)
  }, [allTokens, updateTokensByAddress, updateTokensBySymbol])

  return null
}
