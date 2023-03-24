import { useUniswapTokenLogo } from '@cow/api/uniswap/hooks'
import { Currency } from '@uniswap/sdk-core'

export function useExternalTokenLogo(currency?: Currency | null): string | void {
  const logo = useUniswapTokenLogo(currency?.chainId, currency?.isToken ? currency?.address : undefined)

  return logo
}
