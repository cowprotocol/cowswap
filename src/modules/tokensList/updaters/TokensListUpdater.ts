import { useUpdateAtom } from 'jotai/utils'
import { useEffect, useMemo } from 'react'

import { useTokensListWithDefaults } from 'legacy/state/lists/hooks'

import { tokensByAddressAtom, tokensBySymbolAtom, TokenWithLogo } from 'modules/tokensList/state/tokensListAtom'

/**
 * This updater protects from redundant recalculations
 * Using it we call useTokensListWithDefaults() and map it's result only once
 */
export function TokensListUpdater() {
  const allTokens = useTokensListWithDefaults()
  const updateTokensByAddress = useUpdateAtom(tokensByAddressAtom)
  const updateTokensBySymbol = useUpdateAtom(tokensBySymbolAtom)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allTokensMemo = useMemo(() => allTokens, [JSON.stringify(allTokens)])

  useEffect(() => {
    const tokensByAddressMap: { [address: string]: TokenWithLogo } = {}
    const tokensBySymbolMap: { [address: string]: TokenWithLogo[] } = {}

    allTokensMemo.forEach((token) => {
      const wrappedToken: TokenWithLogo = new TokenWithLogo(
        token.logoURI,
        token.chainId,
        token.address,
        token.decimals,
        token.symbol,
        token.name
      )
      const addressLowerCase = token.address.toLowerCase()
      const symbolLowerCase = token.symbol.toLowerCase()

      if (!tokensByAddressMap[addressLowerCase]) {
        tokensByAddressMap[addressLowerCase] = wrappedToken
      }

      tokensBySymbolMap[symbolLowerCase] = tokensBySymbolMap[symbolLowerCase] || []

      const isTokenInTheSymbolMap = !!tokensBySymbolMap[symbolLowerCase].find(
        (token) => token.address.toLowerCase() === addressLowerCase
      )
      if (!isTokenInTheSymbolMap) {
        tokensBySymbolMap[symbolLowerCase].push(wrappedToken)
      }
    })

    updateTokensByAddress(tokensByAddressMap)
    updateTokensBySymbol(tokensBySymbolMap)
  }, [allTokensMemo, updateTokensByAddress, updateTokensBySymbol])

  return null
}
