import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { doesTokenMatchSymbolOrAddress } from '@cowprotocol/common-utils'
import { NativeCurrency, Token } from '@uniswap/sdk-core'

import { useFavouriteTokens } from 'legacy/state/user/hooks'

import { tokensByAddressAtom, tokensBySymbolAtom } from 'modules/tokensList/state/tokensListAtom'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

export function useTokenBySymbolOrAddress(symbolOrAddress?: string | null): Token | NativeCurrency | null {
  const tokensByAddress = useAtomValue(tokensByAddressAtom)
  const tokensBySymbol = useAtomValue(tokensBySymbolAtom)
  const nativeCurrency = useNativeCurrency()
  const favouriteTokens = useFavouriteTokens()

  return useMemo(() => {
    if (!symbolOrAddress) {
      return null
    }

    const symbolOrAddressLowerCase = symbolOrAddress.toLowerCase()

    if (nativeCurrency.symbol?.toLowerCase() === symbolOrAddressLowerCase) {
      return nativeCurrency
    }

    const foundByAddress = tokensByAddress[symbolOrAddressLowerCase]

    if (foundByAddress) return foundByAddress

    const foundBySymbol = tokensBySymbol[symbolOrAddressLowerCase]

    if (foundBySymbol) return foundBySymbol[0]

    return favouriteTokens.find((item) => doesTokenMatchSymbolOrAddress(item, symbolOrAddress)) || null
  }, [symbolOrAddress, nativeCurrency, tokensByAddress, tokensBySymbol, favouriteTokens])
}
