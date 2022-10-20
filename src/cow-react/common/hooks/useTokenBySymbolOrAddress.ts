import { Token } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { useAllTokensList } from 'cow-react/common/hooks/useAllTokensList'

export function useTokenBySymbolOrAddress(symbolOrAddress?: string | null): Token | null {
  const tokens = useAllTokensList()

  return useMemo(() => {
    if (!symbolOrAddress) {
      return null
    }

    return (
      tokens.find(
        (item) => item.address.toLowerCase() === symbolOrAddress.toLowerCase() || item.symbol === symbolOrAddress
      ) || null
    )
  }, [tokens, symbolOrAddress])
}
