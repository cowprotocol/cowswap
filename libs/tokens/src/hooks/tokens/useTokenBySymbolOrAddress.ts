import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isAddress } from '@ethersproject/address'

import { useTokensByAddressMap } from './useTokensByAddressMap'

import { environmentAtom } from '../../state/environmentAtom'
import { tokensBySymbolAtom } from '../../state/tokens/allTokensAtom'
import { userAddedTokensAtom } from '../../state/tokens/userAddedTokensAtom'

export function useTokenBySymbolOrAddress(symbolOrAddress?: string | null): TokenWithLogo | null {
  const tokensByAddress = useTokensByAddressMap()
  const tokensBySymbol = useAtomValue(tokensBySymbolAtom).tokens
  const userAddedTokens = useAtomValue(userAddedTokensAtom)
  const { chainId } = useAtomValue(environmentAtom)

  return useMemo(() => {
    if (!symbolOrAddress || !chainId) {
      return null
    }

    const symbolOrAddressLowerCase = symbolOrAddress.toLowerCase()
    const userAddedTokensForChain = userAddedTokens[chainId] || {}

    // Check if the input is a valid address format
    if (isAddress(symbolOrAddress)) {
      const lowerAddress = symbolOrAddressLowerCase // Already lowercased
      const tokenInfo = userAddedTokensForChain[lowerAddress]

      if (tokenInfo) {
        // Found in user-added tokens by address
        return TokenWithLogo.fromToken(tokenInfo, tokenInfo.logoURI)
      }
      // If it IS an address but NOT in user-added tokens,
      // we still fall through to check the main tokensByAddress map below.
    } else {
      // Input is NOT an address, check if it's a symbol in user-added tokens
      const userTokenWithMatchingSymbol = Object.values(userAddedTokensForChain).find(
        (tokenInfo) => tokenInfo.symbol?.toLowerCase() === symbolOrAddressLowerCase,
      )

      if (userTokenWithMatchingSymbol) {
        return TokenWithLogo.fromToken(userTokenWithMatchingSymbol, userTokenWithMatchingSymbol.logoURI)
      }
      // If it's NOT an address and also NOT a symbol in user-added tokens,
      // fall through to check main token maps.
    }

    // Check the derived active tokens maps (main lists, etc.)
    const foundByAddress = tokensByAddress[symbolOrAddressLowerCase] // Check address in main map
    if (foundByAddress) return foundByAddress

    const foundBySymbol = tokensBySymbol[symbolOrAddressLowerCase] // Check symbol in main map
    if (foundBySymbol?.length) return foundBySymbol[0] // Return the first match by symbol

    return null
  }, [symbolOrAddress, tokensByAddress, tokensBySymbol, userAddedTokens, chainId])
}
