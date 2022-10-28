import { NativeCurrency, Token } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { useAllTokensList } from 'cow-react/common/hooks/useAllTokensList'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

export function useTokenBySymbolOrAddress(symbolOrAddress?: string | null): Token | NativeCurrency | null {
  const tokens = useAllTokensList()
  const nativeCurrency = useNativeCurrency()

  return useMemo(() => {
    if (!symbolOrAddress) {
      return null
    }

    if (nativeCurrency.symbol === symbolOrAddress) {
      return nativeCurrency
    }

    return (
      tokens.find(
        (item) => item.address.toLowerCase() === symbolOrAddress.toLowerCase() || item.symbol === symbolOrAddress
      ) || null
    )
  }, [symbolOrAddress, nativeCurrency, tokens])
}
