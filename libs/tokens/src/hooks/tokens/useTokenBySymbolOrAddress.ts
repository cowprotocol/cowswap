import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddress } from '@ethersproject/address'

import { useTokensByAddressMap } from './useTokensByAddressMap'

import { environmentAtom } from '../../state/environmentAtom'
import { tokensBySymbolAtom } from '../../state/tokens/allTokensAtom'
import { userAddedTokensAtom } from '../../state/tokens/userAddedTokensAtom'

export function useTokenBySymbolOrAddress(symbolOrAddress?: string | null): TokenWithLogo | null {
  const tokensByAddress = useTokensByAddressMap()
  const tokensBySymbol = useAtomValue(tokensBySymbolAtom).tokens
  // Get user added tokens state
  const userAddedTokens = useAtomValue(userAddedTokensAtom)
  const { chainId } = useAtomValue(environmentAtom)

  return useMemo(() => {
    if (!symbolOrAddress || !chainId) {
      return null
    }

    const symbolOrAddressLowerCase = symbolOrAddress.toLowerCase()
    const userAddedTokensForChain = userAddedTokens[chainId] || {}

    // Check if it's an address in the userAddedTokens map first
    try {
      const checksummedAddress = getAddress(symbolOrAddress)
      const tokenInfo = userAddedTokensForChain[checksummedAddress.toLowerCase()]

      if (tokenInfo) {
        // Need to reconstruct TokenWithLogo as userAddedTokensAtom stores TokenInfo
        return TokenWithLogo.fromToken(tokenInfo, tokenInfo.logoURI)
      }
    } catch {
      // Ignore if not a valid address (e.g., it's a symbol)
    }

    // Check all user-added tokens to see if any match the symbol
    if (userAddedTokensForChain && Object.keys(userAddedTokensForChain).length > 0) {
      // Find the first token with a matching symbol
      const userTokenWithMatchingSymbol = Object.values(userAddedTokensForChain).find(
        (tokenInfo) => tokenInfo.symbol?.toLowerCase() === symbolOrAddressLowerCase,
      )

      if (userTokenWithMatchingSymbol) {
        return TokenWithLogo.fromToken(userTokenWithMatchingSymbol, userTokenWithMatchingSymbol.logoURI)
      }
    }

    // Check the derived active tokens maps if not found in userAddedTokens
    const foundByAddress = tokensByAddress[symbolOrAddressLowerCase]
    if (foundByAddress) return foundByAddress

    const foundBySymbol = tokensBySymbol[symbolOrAddressLowerCase]
    if (foundBySymbol?.length) return foundBySymbol[0] // Return the first match by symbol

    return null
  }, [symbolOrAddress, tokensByAddress, tokensBySymbol, userAddedTokens, chainId])
}
