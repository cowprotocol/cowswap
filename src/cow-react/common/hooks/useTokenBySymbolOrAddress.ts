import { NativeCurrency, Token } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { useAllTokensList } from 'cow-react/common/hooks/useAllTokensList'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { useFavouriteTokens } from 'state/user/hooks'

export function useTokenBySymbolOrAddress(symbolOrAddress?: string | null): Token | NativeCurrency | null {
  const tokens = useAllTokensList()
  const nativeCurrency = useNativeCurrency()
  const favouriteTokens = useFavouriteTokens()
  const checkBySymbolAndAddress = (token: Token, symbolOrAddress: string) =>
    token.address.toLowerCase() === symbolOrAddress.toLowerCase() ||
    token.symbol?.toLowerCase() === symbolOrAddress.toLowerCase()

  return useMemo(() => {
    if (!symbolOrAddress) {
      return null
    }

    if (nativeCurrency.symbol === symbolOrAddress) {
      return nativeCurrency
    }

    return (
      tokens.find((item) => checkBySymbolAndAddress(item, symbolOrAddress)) ||
      favouriteTokens.find((item) => checkBySymbolAndAddress(item, symbolOrAddress)) ||
      null
    )
  }, [symbolOrAddress, nativeCurrency, tokens, favouriteTokens])
}
