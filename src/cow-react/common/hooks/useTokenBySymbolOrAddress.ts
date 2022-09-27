import { useAllTokens } from 'hooks/Tokens'
import { Token } from '@uniswap/sdk-core'
import { useMemo } from 'react'

export function useTokenBySymbolOrAddress(symbolOrAddress?: string | null): Token | null {
  const tokens = useAllTokens()

  return useMemo(() => {
    if (!symbolOrAddress) {
      return null
    }

    return (
      Object.values(tokens).find(
        (item) => item.address.toLowerCase() === symbolOrAddress || item.symbol === symbolOrAddress
      ) || null
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens, symbolOrAddress])
}
